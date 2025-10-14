import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ConsultationCreateSchema, DepenseCreateSchema } from "@/types/Entries";
import dayjs from "dayjs";
import { logger } from "@/utils/pino";
import { db } from "@/server/db";

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
        include: { template: true, cashFund: true },
      });
      logger.debug({ currentShift }, "current Shift");
      // 🟢 CASE 1: No shift at all → user can start immediately
      if (!currentShift) return true;

      // 🟢 CASE 1.5: if a user can do 2 shifts in one day
      // if (currentShift.userId === ctx.session.user.id) return false;

      // 2️⃣ Check if user can start next shift early
      const { endHour } = currentShift.template;

      const currentHour = now.hour();
      const shiftStartDay = dayjs(currentShift.startTime).startOf("day");
      const currentDay = now.startOf("day");

      // 🟢 CASE 2: It’s a new date → allow starting
      if (!shiftStartDay.isSame(currentDay)) return true;

      // 🟢 CASE 2: Shift already exceeded its template end → allow starting
      if (currentHour >= endHour) return true;

      // Example: allow starting next shift if within 1 hour before its end
      if (endHour > now.hour()) {
        const isWithinNextShiftWindow =
          endHour - now.hour() <= 1 || 24 - now.hour() + endHour <= 1;

        // 🟢 CASE 3: Current shift is ending soon → allow early start
        if (isWithinNextShiftWindow) return true;
      }

      // 🔴 Otherwise, deny starting a new shift
      return false;
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
