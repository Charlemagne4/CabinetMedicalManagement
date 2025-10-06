import { prisma } from "../../../../prisma/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ConsultationCreateSchema, DepenseCreateSchema } from "@/types/Entries";
import dayjs from "dayjs";

const entrySchema = z.discriminatedUnion("type", [
  DepenseCreateSchema.extend({ type: z.literal("DEPENSE") }),
  ConsultationCreateSchema.extend({ type: z.literal("CONSULTATION") }),
]);

export const ShiftRouter = createTRPCRouter({
  getCurrent: protectedProcedure.query(async ({ input, ctx }) => {
    try {
      const shift = await ctx.db.shift.findFirst({
        where: {
          userId: ctx.session.user.id,
          OR: [{ endTime: null }, { endTime: { isSet: false } }],
        },
      });
      return shift;
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Get Current shift failed",
      });
    }
  }),
  create: protectedProcedure
    .input(
      z.object({ cashfund: z.number().min(1, "invalid CashFund value min 1") }),
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const now = dayjs();
      const currentShift = await prisma.shift.findFirst({
        where: {
          startTime: { gte: now.toDate() },
          endTime: now.toDate(),
        },
      });
      if (currentShift?.userId === session.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      await prisma.shift.updateMany({
        where: {
          AND: [
            { startTime: { gte: now.toDate() } },
            { OR: [{ endTime: { lte: now.toDate() } }, { endTime: null }] },
          ],
        },
        data: { endTime: now.toDate() },
      });

      const createdShift = await prisma.shift.create({
        data: { startTime: now.toDate(), userId: session.user.id },
      });

      return true;
    }),
});
