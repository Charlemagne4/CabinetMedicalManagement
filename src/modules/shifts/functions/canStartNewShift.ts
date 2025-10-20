import { now } from "@/lib/daysjs";
import { db } from "@/server/db";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";

type shift = Prisma.ShiftGetPayload<{
  include: { template: true; cashFund: true };
}>;

export function canStartNewShift(currentShift?: shift | null): boolean {
  if (!currentShift) return true;

  const { endHour, startHour } = currentShift.template;
  const currentHour = now.hour();

  const shiftStartDay = dayjs(currentShift.startTime);
  const currentDay = now;

  // 🟢 CASE 1: It's a new calendar day → allow new shift
  if (!shiftStartDay.isSame(currentDay)) return true;

  // 🟢 CASE 2: Current time is past shift end (normal case)
  if (startHour < endHour && currentHour >= endHour) return true;

  // 🟢 CASE 3: Overnight shift (e.g. 16 → 0 or 20 → 4)
  if (startHour > endHour) {
    // If it's after midnight but before next day's endHour, still in shift
    if (currentHour < endHour) return false;
    // If it's after previous evening’s shift ended → can start
    if (currentHour >= endHour && currentHour < startHour) return true;
  }

  // 🟢 CASE 4: Within 1h before next shift → allow pre-start
  const hoursUntilEnd =
    endHour >= currentHour ? endHour - currentHour : 24 - currentHour + endHour;
  if (hoursUntilEnd <= 1) return true;

  return false;
}
