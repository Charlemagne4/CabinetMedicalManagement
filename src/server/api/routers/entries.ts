import { prisma } from "../../../../prisma/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ConsultationCreateSchema, DepenseCreateSchema } from "@/types/Entries";
import type { Session } from "next-auth";

const entrySchema = z.discriminatedUnion("type", [
  DepenseCreateSchema.extend({ type: z.literal("DEPENSE") }),
  ConsultationCreateSchema.extend({ type: z.literal("CONSULTATION") }),
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
      try {
        const { limit, cursor } = input;
        const { id: userId } = ctx.session.user;

        console.log(userId);
        if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

        const data = await prisma.operation.findMany({
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
      } catch (err) {
        console.error("Registration error:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Registration failed",
        });
      }
    }),
  create: protectedProcedure
    //TODO: Add shift id
    .input(
      z.object({
        entry: entrySchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const { entry } = input;

      await addEntry(entry, session);

      return true;
    }),
});

async function addEntry(
  entry: z.infer<typeof entrySchema>,
  session: Pick<Session, "user">,
) {
  return await prisma.$transaction(async (tx) => {
    //entering in Entry table
    let refId: string;

    switch (entry.type) {
      case "CONSULTATION": {
        const consultation = await tx.consultation.create({
          data: {
            ...entry,
          },
        });
        refId = consultation.id;
        break;
      }
      case "DEPENSE": {
        const depense = await tx.depense.create({
          data: {
            // map only depense-specific fields
            ...entry,
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
        amount: entry.amount,
        type: entry.type,
        refId,
        userId: session.user.id,
        label:
          entry.type === "CONSULTATION" ? `${entry.patient}` : `${entry.label}`,
        // other common fields if needed
      },
    });

    //deduct or add amount
    const recette = await tx.recette.updateMany({
      data: {
        totalAmount:
          entry.type === "CONSULTATION"
            ? { increment: entry.amount }
            : { decrement: entry.amount },
      },
    });

    return operation;
  });
}
