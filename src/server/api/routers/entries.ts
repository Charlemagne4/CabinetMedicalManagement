import { prisma } from "../../../../prisma/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ConsultationCreateSchema, DepenseCreateSchema } from "@/types/Entries";

const EntrySchema = z.discriminatedUnion("type", [
  DepenseCreateSchema.extend({ type: z.literal("depense") }),
  ConsultationCreateSchema.extend({ type: z.literal("consultation") }),
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
    .input(
      z.object({
        entry: EntrySchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("entry to add: ", input);

      return true;
    }),
});
