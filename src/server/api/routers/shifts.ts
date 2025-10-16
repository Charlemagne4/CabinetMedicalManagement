import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import dayjs from "dayjs";
import { logger } from "@/utils/pino";
import { db } from "@/server/db";
import { getCurrentShift } from "@/modules/shifts/functions/StartShiftOnLogin";
import { canStartNewShift } from "@/modules/shifts/functions/canStartNewShift";

export const ShiftRouter = createTRPCRouter({
  getCurrent: protectedProcedure.query(async ({ input, ctx }) => {
    try {
      const currentShift = await getCurrentShift();
      logger.debug({ currentShift }, "current Shift");

      return canStartNewShift(currentShift);
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Now `err` is an `Error`
        logger.error({ err: err.message }, "Error message");
        // If using tRPC, rethrow or wrap in TRPCError
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message,
          cause: err,
        });
      } else {
        // err is not an Error — handle fallback

        logger.error({ err }, "Unknown error");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unknown error",
        });
      }
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
      const template = await db.shiftTemplate.findFirstOrThrow({
        where: {
          startHour: { lte: now.hour() },
          endHour: { gte: now.hour() },
        },
      });

      // Check if user already has an active shift
      const currentShift = await db.shift.findFirst({
        where: {
          AND: [{ OR: [{ endTime: null }, { endTime: { isSet: false } }] }],
        },
        include: { template: true },
      });

      const shiftStartDay = dayjs(currentShift?.startTime).startOf("day");
      const currentDay = now.startOf("day");
      // 🕒 Check if within 1h before next shift

      const isWithinNextShiftWindow =
        currentShift &&
        (currentShift.template.endHour - now.hour() <= 1 ||
          24 - now.hour() + currentShift.template.endHour <= 1);

      // ❌ Prevent user from starting multiple shifts
      if (
        currentShift?.userId === session.user.id &&
        !isWithinNextShiftWindow &&
        shiftStartDay.isSame(currentDay)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already have an active shift.",
        });
      }

      // If we reach here, close old shifts & start a new one
      await db.$transaction(async (tx) => {
        // Close any open shifts
        await tx.shift.updateMany({
          where: {
            id: currentShift?.id,
            AND: [{ OR: [{ endTime: null }, { endTime: { isSet: false } }] }],
          },
          data: { endTime: now.toDate() },
        });
        // Create new shift
        const createdShift = await tx.shift.create({
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
