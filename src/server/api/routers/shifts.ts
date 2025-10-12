import { prisma } from "../../../../prisma/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ConsultationCreateSchema, DepenseCreateSchema } from "@/types/Entries";
import dayjs from "dayjs";

export const ShiftRouter = createTRPCRouter({
  getCurrent: protectedProcedure.query(async ({ input, ctx }) => {
    try {
      const now = dayjs();

      // 1️⃣ Check if the user already has an active or ongoing shift
      const currentShift = await ctx.db.shift.findFirst({
        where: {
          AND: [
            { startTime: { lte: now.toDate() } },
            { OR: [{ endTime: null }, { endTime: { isSet: false } }] },
          ],
        },
        include: { template: true },
      });
      console.log("currentShift", currentShift);
      // 🟢 CASE 1: No shift at all → user can start immediately
      if (!currentShift) return true;

      // 🟢 CASE 1.5: No shift at all → user can start immediately
      // if (currentShift.userId === ctx.session.user.id) return false;

      // 2️⃣ Check if user can start next shift early
      const { endHour } = currentShift.template;

      // Example: allow starting next shift if within 1 hour before its end
      const isWithinNextShiftWindow = now.hour() + 1 >= endHour;

      // 🟢 CASE 2: Current shift is ending soon → allow early start
      if (isWithinNextShiftWindow) return true;

      // 🔴 Otherwise, deny starting a new shift
      return false;
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
      const { cashfund } = input;
      const now = dayjs();

      // Find current shift template matching current time
      const template = await prisma.shiftTemplate.findFirstOrThrow({
        where: {
          startHour: { lte: now.hour() },
          endHour: { gte: now.hour() },
        },
      });

      // Check if user already has an active shift
      const currentShift = await prisma.shift.findFirst({
        where: {
          AND: [{ OR: [{ endTime: null }, { endTime: { isSet: false } }] }],
        },
        include: { template: true },
      });

      // 🕒 Check if within 1h before next shift
      const isWithinNextShiftWindow =
        currentShift && now.hour() + 1 >= currentShift.template.endHour;

      // ❌ Prevent user from starting multiple shifts
      if (
        currentShift?.userId === session.user.id &&
        !isWithinNextShiftWindow
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already have an active shift.",
        });
      }

      // If we reach here, close old shifts & start a new one
      await prisma.$transaction(async (tx) => {
        // Close any open shifts
        await tx.shift.updateMany({
          where: {
            id: currentShift?.id,
            AND: [{ OR: [{ endTime: null }, { endTime: { isSet: false } }] }],
          },
          data: { endTime: now.toDate() },
        });

        // Create new shift
        await tx.shift.create({
          data: {
            templateId: template.id,
            startTime: now.toDate(),
            userId: session.user.id,
            cashFund: { create: { amount: cashfund } },
          },
        });
      });

      return true;
    }),
});
