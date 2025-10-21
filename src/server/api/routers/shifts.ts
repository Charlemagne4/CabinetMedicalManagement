import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import dayjs from "dayjs";
import { logger } from "@/utils/pino";
import { db } from "@/server/db";
import {
  getCurrentShift,
  getShiftTemplateForNow,
} from "@/modules/shifts/functions/StartShiftOnLogin";
import { canStartNewShift } from "@/modules/shifts/functions/canStartNewShift";
import { DEFAULT_LIMIT } from "@/constants";
import { now } from "@/lib/daysjs";

export const ShiftRouter = createTRPCRouter({
  // 2️⃣ Get all operations of one shift (with pagination)
  getShiftOperations: protectedProcedure
    .input(
      z.object({
        shiftId: z.string(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT),
        cursor: z
          .object({
            id: z.string(),
            date: z.date(),
          })
          .nullish(),
      }),
    )
    .query(async ({ input }) => {
      const { shiftId, limit, cursor } = input;

      const data = await db.operation.findMany({
        where: { shiftId },
        include: {
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
  getMany: protectedProcedure
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
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const { db, session } = ctx;
      // TODO: Remove after debug
      await getShiftTemplateForNow();
      const data = await db.shift.findMany({
        include: {
          cashFund: true,
          recettes: true,
          expenses: true,
          user: true,
          template: true,
          Operations: {
            include: {
              user: {
                select: { name: true, role: true, email: true, id: true },
              },
            },
            orderBy: {
              date: "desc", // or whatever field you want
            },
            take: limit + 1,
          },
        },
        orderBy: [
          { startTime: "desc" },
          { id: "desc" }, // secondary key for stable ordering
        ],
        take: limit + 1, // fetch one extra to check if there's more
        ...(cursor
          ? {
              cursor: { startTime: cursor.date, id: cursor.id },
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
                date: lastItem.startTime,
              }
            : null,
      };
    }),
  getCurrent: protectedProcedure.query(async ({ input, ctx }) => {
    try {
      const currentShift = await getCurrentShift();
      logger.debug({ currentShift }, "current Shift");
      const canStartNewShiftValue = canStartNewShift(currentShift);
      logger.debug({ canStartNewShift }, "can start a new SHIFT ? ");
      return canStartNewShiftValue;
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
      const currentHour = now.hour();
      logger.debug({ currentHour: currentHour });

      // Find current shift template matching current time
      const template = await getShiftTemplateForNow();

      if (!template) throw new TRPCError({ code: "CONFLICT" });
      // Check if user already has an active shift
      const currentShift = await getCurrentShift();

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
        // get the last operation in the shift
        const lastOperation = await tx.operation.findFirst({
          where: { shiftId: currentShift?.id },
          orderBy: { date: "desc" },
        });

        // Close any open shifts
        await tx.shift.updateMany({
          where: {
            id: currentShift?.id,
            AND: [{ OR: [{ endTime: null }, { endTime: { isSet: false } }] }],
          },
          data: { endTime: lastOperation?.date },
        });
        // Create new shift
        const createdShift = await tx.shift.create({
          data: {
            templateId: template.id,
            startTime: now.toDate(),
            userId: session.user.id,
            cashFund: { create: { amount: cashfund } },
            recettes: { create: { totalAmount: 0, date: now.toDate() } },
          },
        });
        logger.debug(createdShift);
      });

      return true;
    }),
});
