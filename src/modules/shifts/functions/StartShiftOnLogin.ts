import dayjs from "dayjs";
import { prisma } from "../../../../prisma/prisma";
import { logger } from "@/utils/pino";
import { db } from "@/server/db";
import { now } from "@/lib/daysjs";

// // helper: get the template based on current hour

export async function getShiftTemplateForNow() {
  const templates = await db.shiftTemplate.findMany();
  const currentHour = now.hour();
  const currentMinute = now.minute();
  const currentTimeInHours = currentHour + currentMinute / 60;

  // Adjusted time rule: within 1 hour before next shift = counts as next shift
  const adjustedTime =
    currentTimeInHours + 1 >= 24
      ? currentTimeInHours + 1 - 24
      : currentTimeInHours + 1;

  const template = templates.find((template) => {
    const { startHour, endHour } = template;

    if (endHour > startHour) {
      // Normal shift (e.g. 8–16)
      return adjustedTime >= startHour && adjustedTime < endHour;
    } else {
      // Overnight shift (e.g. 16–00 or 00–8)
      return adjustedTime >= startHour || adjustedTime < endHour;
    }
  });

  logger.debug({ template }, "current template");
  return template ?? null;
}

// export async function startShiftOnLogin(userId: string) {
//   const now = dayjs();
//   const todayStart = now.startOf("day").toDate();

//   // find active shift
//   let shift = await prisma.shift.findFirst({
//     where: { startTime: { gte: todayStart } },
//   });

//   if (shift?.userId === userId) {
//     return { ...shift, continueShiftRequest: true };
//   }

//   if (!shift) {
//     const template = await getShiftTemplateForNow();

//     shift = await prisma.shift.create({
//       data: {
//         startTime: now.toDate(),
//         userId: userId,
//         confirmed: true,
//         templateId: template?.id, // 👈 link to template if found
//       },
//     });
//   } else if (!shift.userId) {
//     shift = await prisma.shift.update({
//       where: { id: shift.id },
//       data: { userId },
//     });
//   }

//   return { ...shift, continueShiftRequest: false };
// }

// export async function getCurrentShift() {
//   const now = dayjs();

//   const currentShift = await prisma.shift.findFirst({
//     where: {
//       startTime: { lte: now.toDate() }, // started already
//       OR: [
//         { endTime: null }, // not finished
//         { endTime: { isSet: false } }, // not finished
//         { endTime: { gt: now.toDate() } }, // still active
//       ],
//     },
//     include: { template: true, cashFund: true },
//     orderBy: { startTime: "desc" },
//   });
//   return currentShift;
// }

export async function getCurrentShift() {
  const currentHour = now.hour();
  const currentDate = now.toDate();
  const midnightToday = now.startOf("day").toDate();

  // 🟢 STEP 1: Find any shift that started today (or late last night) and is still open
  const ongoingShift = await prisma.shift.findFirst({
    where: {
      OR: [
        // started today and not ended
        {
          startTime: { gte: midnightToday },
          OR: [{ endTime: null }, { endTime: { isSet: false } }],
        },
        // OR started yesterday (for overnight shifts)
        {
          startTime: { gte: dayjs(midnightToday).subtract(1, "day").toDate() },
          OR: [{ endTime: null }, { endTime: { isSet: false } }],
        },
      ],
    },
    include: {
      user: true,
      template: true,
      recettes: true,
      cashFund: true,
    },
    orderBy: { startTime: "desc" },
  });

  // 🟢 If we found an ongoing shift, return it immediately
  if (ongoingShift) return ongoingShift;

  // 🟡 Otherwise, use the current template logic to infer which shift *should* be active
  const currentTemplate = await getShiftTemplateForNow();

  if (!currentTemplate) {
    logger.error("No template found for this hour");
    return null;
  }

  // Determine if we should look at yesterday (overnight shift)
  const startBoundary =
    currentTemplate.endHour < currentTemplate.startHour &&
    currentHour < currentTemplate.endHour
      ? dayjs(midnightToday).subtract(1, "day").toDate()
      : midnightToday;

  const predictedShift = await prisma.shift.findFirst({
    where: {
      templateId: currentTemplate.id,
      startTime: { gte: startBoundary },
      OR: [{ endTime: null }, { endTime: { isSet: false } }],
    },
    include: {
      user: true,
      template: true,
      recettes: true,
      cashFund: true,
    },
  });

  return predictedShift;
}
