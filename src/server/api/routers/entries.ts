import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ConsultationCreateSchema, DepenseCreateSchema } from "@/types/Entries";
import type { Session } from "next-auth";
import { getCurrentShift } from "@/modules/shifts/functions/StartShiftOnLogin";

import { db } from "@/server/db";
import { logger } from "@/utils/pino";
import { now } from "@/lib/daysjs";
import { ConsultationType } from "@prisma/client";

const entrySchema = z.discriminatedUnion("Entrytype", [
  DepenseCreateSchema.extend({ Entrytype: z.literal("DEPENSE") }),
  ConsultationCreateSchema.extend({ Entrytype: z.literal("CONSULTATION") }),
]);

export const entriesRouter = createTRPCRouter({
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
        const credit = await tx.credit.upsert({
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
    .input(z.object({ creditId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { creditId } = input;
      const { db, session } = ctx;

      const currentShift = await getCurrentShift();

      // 3. If no shift or recette is found, stop
      if (!currentShift?.recettes?.id) {
        throw new Error("No active shift or recette found");
      }

      const consultation = await db.$transaction(async (tx) => {
        const foundCredit = await tx.credit.update({
          where: { id: creditId, isPaid: false },
          include: { consultation: { include: { Shift: true } } },
          data: { isPaid: true },
        });
        if (!foundCredit)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "pas de credit pour cette operation",
          });

        const recette = await tx.recette.update({
          where: { id: currentShift.recettes?.id },
          data: {
            totalAmount: { increment: foundCredit.amount },
          },
        });
        return foundCredit.consultation;
      });

      return {
        message: "Credit paid successfully",
        shiftId: consultation.Shift?.id,
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
      const { id: userId } = ctx.session.user;
      const currentShift = await getCurrentShift();

      if (!currentShift) return { items: [], reason: "NO_ACTIVE_SHIFT" };

      logger.debug(userId);
      // if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const data = await db.operation.findMany({
        where: {
          shiftId: currentShift.id,
        },
        include: {
          consultation: { include: { credit: true } },
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

      const currentShift = await getCurrentShift();

      if (!currentShift)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "no shift active",
        });
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
    //entering in Entry table
    let refId: string;
    let consultation;
    switch (entry.Entrytype) {
      case "CONSULTATION": {
        consultation = await tx.consultation.create({
          data: {
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
        refId = consultation.id;
        break;
      }
      case "DEPENSE": {
        const depense = await tx.depense.create({
          data: {
            date: now().toDate(),
            shiftId,
            // map only depense-specific fields
            amount: entry.amount,
            label: entry.label,
          },
        });
        refId = depense.id;
        break;
      }
      default:
        throw new TRPCError({
          message: "Unsupported Entry Type",
          code: "BAD_REQUEST",
        });
    }
    //entering in operation table
    const operation = await tx.operation.create({
      data: {
        date: now().toDate(),
        shiftId,
        amount: entry.amount,
        type: entry.Entrytype,
        refId,
        userId: session.user.id,
        consultationId: consultation?.id,
        label:
          entry.Entrytype === "CONSULTATION"
            ? `${entry.patient}`
            : `${entry.label}`,
        // other common fields if needed
      },
    });
    logger.debug(currentRecettesId);
    //return if it's a credit
    if (entry.Entrytype === "CONSULTATION" && entry.credit) return operation;
    //deduct or add amount
    const recette = await tx.recette.updateMany({
      where: { id: currentRecettesId },
      data: {
        totalAmount:
          entry.Entrytype === "CONSULTATION"
            ? { increment: entry.amount }
            : { decrement: entry.amount },
      },
    });

    return operation;
  });
}
