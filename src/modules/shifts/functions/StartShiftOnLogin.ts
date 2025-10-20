import dayjs from "dayjs";
import { prisma } from "../../../../prisma/prisma";
import { logger } from "@/utils/pino";
import { db } from "@/server/db";
import { now } from "@/lib/daysjs";

// // helper: get the template based on current hour
// async function getShiftTemplateForNow() {
//   const hour = now.hour();

//   // find template in DB that matches this hour
//   const template = await prisma.shiftTemplate.findFirst({
//     where: {
//       startHour: { lte: hour },
//       endHour: { gt: hour },
//     },
//   });

//   // if it's a night shift crossing midnight (e.g. 16 → 0), handle wrap-around
//   if (!template) {
//     return await prisma.shiftTemplate.findFirst({
//       where: {
//         startHour: { gt: hour },
//         endHour: 0, // meaning ends at midnight or wraps
//       },
//     });
//   }

//   return template;
// }

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

  // Fetch shift templates (8–16 and 16–00)
  const templates = await prisma.shiftTemplate.findMany();

  // Find which template matches current hour
  const currentTemplate = templates.find((template) => {
    if (template.endHour > template.startHour) {
      // Normal shift (ex: 8–16)
      return (
        currentHour >= template.startHour && currentHour < template.endHour
      );
    } else {
      // Overnight shift (ex: 16–00)
      return (
        currentHour >= template.startHour || currentHour < template.endHour
      );
    }
  });
  logger.debug(currentTemplate);

  if (!currentTemplate) {
    console.log("No template found for this hour");
    return null;
  }

  // Define midnight boundary for today's date
  const midnightToday = now.startOf("day").toDate();

  // If shift is overnight (ex: 16–00) and we're past midnight (00–07),
  // then its start time was *yesterday*.
  const startBoundary =
    currentTemplate.endHour < currentTemplate.startHour &&
    currentHour < currentTemplate.endHour
      ? dayjs(midnightToday).subtract(1, "day").toDate()
      : midnightToday;

  const activeShift = await prisma.shift.findFirst({
    where: {
      templateId: currentTemplate.id,
      startTime: { gte: startBoundary },

      OR: [{ endTime: { isSet: false } }, { endTime: null }],
    },
    include: {
      user: true,
      template: true,
      recettes: true,
      cashFund: true,
    },
  });
  return activeShift;
}
