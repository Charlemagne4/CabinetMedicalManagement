import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ConsultationCreateSchema, DepenseCreateSchema } from "@/types/Entries";
import type { Session } from "next-auth";
import { getCurrentShift } from "@/modules/shifts/functions/StartShiftOnLogin";

import { db } from "@/server/db";
import { logger } from "@/utils/pino";
import { now } from "@/lib/daysjs";

const entrySchema = z.discriminatedUnion("Entrytype", [
  DepenseCreateSchema.extend({ Entrytype: z.literal("DEPENSE") }),
  ConsultationCreateSchema.extend({ Entrytype: z.literal("CONSULTATION") }),
]);

export const entriesRouter = createTRPCRouter({
  getCredits: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string(),
            date: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;
      const { limit, cursor } = input;

      const data = await db.operation.findMany({
        where: {
          Consultation: { credit: { isNot: null } },
        },
        include: {
          Shift: true,
          Consultation: { include: { credit: true } },
          user: {
            select: { name: true, role: true, email: true, id: true },
          },
        },
        orderBy: [
          { date: "desc" },
          { id: "desc" }, // secondary key for stable ordering
        ],
        take: limit + 1, // fetch one extra to check if there's more
        ...(cursor
          ? {
              cursor: { date: cursor.date, id: cursor.id },
              skip: 1,
            }
          : {}),
      });
      const hasMore = data.length > limit;
      //remove last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1];

      return {
        items,
        nextCursor:
          hasMore && lastItem
            ? {
                id: lastItem.id,
                date: lastItem.date,
              }
            : null,
      };
    }),
  getActivitySummary: protectedProcedure.query(async ({}) => {
    const shift = await getCurrentShift();
    if (!shift) return null;

    const totalRecettes = shift.recettes?.totalAmount ?? 0;
    const totalDepenses = shift.expenses.reduce(
      (sum, d) => sum + (d.amount ?? 0),
      0,
    );

    // From consultations → credits
    const allCredits = shift.consultations
      .map((c) => c.credit)
      .filter((c): c is NonNullable<typeof c> => !!c);

    const creditsAdded = allCredits
      .filter((c) => !c.isPaid)
      .reduce((sum, c) => sum + (c.amount ?? 0), 0);

    const creditsPaid = allCredits
      .filter((c) => c.isPaid)
      .reduce((sum, c) => sum + (c.amount ?? 0), 0);

    const balance = totalRecettes - totalDepenses;
    const netProfit = totalRecettes + creditsPaid - totalDepenses;
    const expectedProfit =
      totalRecettes + creditsPaid + creditsAdded - totalDepenses;

    return {
      shiftId: shift.id,
      shiftName:
        shift.template?.name ?? shift.startTime.toLocaleDateString("fr-FR"),
      startTime: shift.startTime,
      endTime: shift.endTime,
      consultationsCount: shift.consultations.length,
      totalRecettes,
      totalDepenses,
      balance,
      creditsAdded,
      creditsPaid,
      netProfit,
      expectedProfit,
    };
  }),
  getDashboardSummaryData: protectedProcedure.query(async ({ ctx }) => {
    const [totalRevenue, totalDepenses, creditsNonPayes, creditsPayes] =
      await Promise.all([
        ctx.db.recette.aggregate({
          _sum: { totalAmount: true },
        }),
        ctx.db.depense.aggregate({
          _sum: { amount: true },
        }),
        ctx.db.credit.aggregate({
          where: { isPaid: false },
          _sum: { amount: true },
        }),
        ctx.db.credit.aggregate({
          where: { isPaid: true },
          _sum: { amount: true },
        }),
      ]);
    // 💵 Actual profit (only paid + real revenue)
    const netProfit =
      (totalRevenue._sum.totalAmount ?? 0) +
      (creditsPayes._sum.amount ?? 0) -
      (totalDepenses._sum.amount ?? 0);

    // 💰 Expected profit (if all credits are paid)
    const expectedProfit =
      (totalRevenue._sum.totalAmount ?? 0) +
      (creditsPayes._sum.amount ?? 0) +
      (creditsNonPayes._sum.amount ?? 0) -
      (totalDepenses._sum.amount ?? 0);

    return {
      netProfit,
      expectedProfit,
      revenueTotal: totalRevenue._sum.totalAmount ?? 0,
      depensesTotal: totalDepenses._sum.amount ?? 0,
      creditsNonPayes: creditsNonPayes._sum.amount ?? 0,
      creditsPayes: creditsPayes._sum.amount ?? 0,
    };
  }),
  getChartEntries: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const [unpaidCredits, rawConsultations, depenses] = await Promise.all([
      db.credit.count({ where: { isPaid: false } }),
      db.consultation.findMany({}),
      db.depense.count({}),
    ]);

    const consultations = rawConsultations.reduce<{
      // bilans: typeof rawConsultations;
      // consultations: typeof rawConsultations;
      count: { bilans: number; consultations: number };
    }>(
      (acc, doc) => {
        if (doc.type === "CONSULTATION") {
          // acc.consultations.push(doc);
          acc.count.consultations++;
        } else if (doc.type === "BILAN") {
          // acc.bilans.push(doc);
          acc.count.bilans++;
        }
        return acc;
      },
      {
        // bilans: [], consultations: [],
        count: { bilans: 0, consultations: 0 },
      },
    );
    return {
      consultations: consultations.count.consultations,
      bilan: consultations.count.bilans,
      unpaidCredits,
      depenses,
    };
  }),
  switchToCredit: protectedProcedure
    .input(z.object({ consultationId: z.string().nullish() }))
    .mutation(async ({ input, ctx }) => {
      const { consultationId } = input;
      const { db, session } = ctx;

      if (!consultationId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "no consultation Id",
        });

      const consultation = await db.$transaction(async (tx) => {
        // 1️⃣ Find the consultation
        const consultation = await tx.consultation.findUnique({
          where: { id: consultationId },
          include: {
            credit: true,
            Shift: { include: { recettes: true } },
          },
        });

        if (consultation?.credit && !consultation.credit.isPaid)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Already a credit",
          });

        if (!consultation)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Consultation inexistante.",
          });

        if (!consultation.shiftId)
          throw new TRPCError({
            code: "CONFLICT",
            message: "Cette consultation n'est rattachée à aucun shift.",
          });

        // 2️⃣ Upsert the credit (one per consultation)
        await tx.credit.upsert({
          where: { consultationId: consultation.id },
          create: {
            isPaid: false,
            consultationId: consultation.id,
            amount: consultation.amount,
            date: now().toDate(),
            userId: session.user.id,
          },
          update: {
            isPaid: false,
            amount: consultation.amount,
            date: now().toDate(),
          },
        });

        // 3️⃣ Ensure there is a recette for this shift
        const recette = consultation?.Shift?.recettes;
        if (!recette)
          throw new TRPCError({
            code: "CONFLICT",
            message: "Aucune recette trouvée pour ce shift.",
          });

        // 4️⃣ Decrement totalAmount (since it's now unpaid)
        await tx.recette.update({
          where: { id: recette.id },
          data: {
            totalAmount: { decrement: consultation.amount },
          },
        });
        return consultation;
      });

      // 5️⃣ Return success
      return {
        message: "Consultation passée en crédit avec succès.",
        shiftId: consultation?.Shift?.id,
      };
    }),

  payCredit: protectedProcedure
    .input(z.object({ creditId: z.string().nullish() }))
    .mutation(async ({ input, ctx }) => {
      const { creditId } = input;
      const { db } = ctx;

      const currentShift = await getCurrentShift();
      if (!creditId) {
        throw new Error("no valid creditId");
      }

      // 3. If no shift or recette is found, stop
      if (!currentShift?.recettes?.id) {
        throw new Error("No active shift or recette found");
      }

      const consultation = await db.$transaction(async (tx) => {
        const foundCredit = await tx.credit.update({
          where: { id: creditId },
          data: {
            isPaid: true,
            consultation: {
              update: {
                shiftId: currentShift.id,
              },
            },
          },
          include: {
            consultation: true,
          },
        });

        await tx.operation.update({
          where: { id: foundCredit.consultation.operationId },
          data: { shiftId: currentShift.id },
        });

        if (!foundCredit)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "pas de credit pour cette operation",
          });
        await tx.recette.update({
          where: { id: currentShift.recettes?.id },
          data: {
            totalAmount: { increment: foundCredit.amount },
          },
        });

        await tx.operation.updateMany({
          where: { Consultation: { id: foundCredit.consultationId } },
          data: { date: now().toDate() },
        });

        return foundCredit.consultation;
      });

      return {
        message: "Credit paid successfully",
        shiftId: consultation.shiftId,
      };
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        userId: z.string().nullish(),
        cursor: z
          .object({
            id: z.string(),
            date: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { limit, cursor } = input;
      const { id: userId, role } = ctx.session.user;
      const currentShift = await getCurrentShift();

      if (!currentShift) return { items: [], reason: "NO_ACTIVE_SHIFT" };
      if (role !== "admin") {
        const currentUser = await db.user.findUnique({
          where: { id: userId },
          include: { ShiftTemplates: true },
        });

        if (
          !currentUser?.ShiftTemplatesIDs.find(
            (userShiftTemplate) =>
              userShiftTemplate === currentShift.templateId,
          )
        )
          return { items: [], reason: "Pas de shift Assigné" };
      }
      logger.debug(userId);
      // if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const data = await db.operation.findMany({
        where: {
          OR: [
            { shiftId: currentShift.id },
            { Consultation: { credit: { isPaid: false } } },
          ],
        },
        include: {
          Shift: true,
          Consultation: { include: { credit: true } },
          user: {
            select: { name: true, role: true, email: true, id: true },
          },
        },
        orderBy: [
          { date: "desc" },
          { id: "desc" }, // secondary key for stable ordering
        ],
        take: limit + 1, // fetch one extra to check if there's more
        ...(cursor
          ? {
              cursor: { date: cursor.date, id: cursor.id },
              skip: 1,
            }
          : {}),
      });
      const hasMore = data.length > limit;
      //remove last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1];

      return {
        items,
        nextCursor:
          hasMore && lastItem
            ? {
                id: lastItem.id,
                date: lastItem.date,
              }
            : null,
      };
    }),
  create: protectedProcedure
    .input(
      z.object({
        entry: entrySchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const { entry } = input;
      const { id: userId, role } = ctx.session.user;

      const currentShift = await getCurrentShift();

      if (!currentShift)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "no shift active",
        });

      if (role !== "admin") {
        const currentUser = await db.user.findUnique({
          where: { id: userId },
          include: { ShiftTemplates: true },
        });

        if (
          !currentUser?.ShiftTemplatesIDs.find(
            (userShiftTemplate) =>
              userShiftTemplate === currentShift.templateId,
          )
        )
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "shift non Assigné",
          });
      }
      logger.debug(entry);
      await addEntry(
        entry,
        session,
        currentShift?.id,
        currentShift.recettes?.id,
      );

      return { shiftId: currentShift.id };
    }),
});

async function addEntry(
  entry: z.infer<typeof entrySchema>,
  session: Pick<Session, "user">,
  shiftId: string,
  currentRecettesId: string | undefined,
) {
  return await db.$transaction(async (tx) => {
    let consultation;
    //entering in operation table
    const operation = await tx.operation.create({
      data: {
        date: now().toDate(),
        shiftId,
        amount: entry.amount,
        type: entry.Entrytype,
        userId: session.user.id,
        label:
          entry.Entrytype === "CONSULTATION"
            ? `${entry.patient}`
            : `${entry.label}`,
        // other common fields if needed
      },
    });
    switch (entry.Entrytype) {
      case "CONSULTATION": {
        consultation = await tx.consultation.create({
          data: {
            operationId: operation.id,
            date: now().toDate(),
            shiftId,
            amount: entry.amount,
            patient: entry.patient,
            type: entry.type,
          },
        });
        if (entry.credit) {
          await tx.credit.create({
            data: {
              userId: session.user.id,
              date: now().toDate(),
              amount: consultation.amount,
              consultationId: consultation.id,
              isPaid: false,
            },
          });
        }
        break;
      }
      case "DEPENSE": {
        await tx.depense.create({
          data: {
            date: now().toDate(),
            shiftId,
            // map only depense-specific fields
            amount: entry.amount,
            label: entry.label,
          },
        });
        break;
      }
      default:
        throw new TRPCError({
          message: "Unsupported Entry Type",
          code: "BAD_REQUEST",
        });
    }
    logger.debug(currentRecettesId);
    //return if it's a credit
    if (entry.Entrytype === "CONSULTATION" && entry.credit) return operation;
    //deduct or add amount
    if (entry.Entrytype === "CONSULTATION") {
      await tx.recette.update({
        where: { id: currentRecettesId },
        data: {
          totalAmount: { increment: entry.amount },
          // : { decrement: entry.amount },
        },
      });
    }

    return operation;
  });
}
