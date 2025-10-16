import { db } from "@/server/db";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";

type shift = Prisma.ShiftGetPayload<{
  include: { template: true; cashFund: true };
}>;

export function canStartNewShift(currentShift?: shift | null): boolean {
  const now = dayjs();

  // 🟢 CASE 1: No current shift → can start
  if (!currentShift) return true;

  const { endHour } = currentShift.template;
  const currentHour = now.hour();

  const shiftStartDay = dayjs(currentShift.startTime).startOf("day");
  const currentDay = now.startOf("day");

  // 🟢 CASE 2: It’s a new date → allow starting
  if (!shiftStartDay.isSame(currentDay)) return true;

  // 🟢 CASE 3: Shift already exceeded its template end → allow starting
  if (currentHour >= endHour) return true;

  // 🟢 CASE 4: Allow starting if within 1 hour of endHour (early start)
  const isWithinNextShiftWindow =
    endHour - currentHour <= 1 || 24 - currentHour + endHour <= 1;

  if (isWithinNextShiftWindow) return true;

  // 🔴 Otherwise, deny
  return false;
}
