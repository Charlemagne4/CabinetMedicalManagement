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

      return true;
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
