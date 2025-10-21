import { now } from "@/lib/daysjs";
import { db } from "@/server/db";
import { logger } from "@/utils/pino";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";

type shift = Prisma.ShiftGetPayload<{
  include: { template: true; cashFund: true };
}>;

export function canStartNewShift(currentShift?: shift | null): boolean {
  if (!currentShift) return true;

  const { startHour, endHour } = currentShift.template;
  const currentHour = now.hour();

  const shiftStartDay = dayjs(currentShift.startTime);
  const currentDay = now;

  // 🟢 CASE 1: New calendar day
  if (!shiftStartDay.isSame(currentDay, "day")) return true;

  // 🟢 CASE 2: Normal shift ended already
  if (startHour < endHour && currentHour >= endHour) return true;

  // 🟢 CASE 3: Overnight shift
  if (startHour > endHour) {
    const isShiftFromYesterday = shiftStartDay.isBefore(currentDay, "day");

    if (currentHour < endHour && isShiftFromYesterday) return false;

    if (
      isShiftFromYesterday &&
      currentHour >= endHour &&
      currentHour < startHour
    )
      return true;
  }

  // 🟢 CASE 4: Within 1 hour before *next* shift start
  const nextShiftStart = endHour; // assume next shift starts where this one ends
  const hoursUntilNextShift = nextShiftStart - currentHour;

  if (hoursUntilNextShift <= 1 && hoursUntilNextShift >= 0) {
    console.log("✅ CASE 4 → within 1h before next shift → can start new one");
    return true;
  }

  return false;
}
