import dayjs from "dayjs";
import { prisma } from "../../../../prisma/prisma";
import { logger } from "@/utils/pino";

// helper: get the template based on current hour
async function getShiftTemplateForNow() {
  const now = dayjs();
  const hour = now.hour();

  // find template in DB that matches this hour
  const template = await prisma.shiftTemplate.findFirst({
    where: {
      startHour: { lte: hour },
      endHour: { gt: hour },
    },
  });

  // if it's a night shift crossing midnight (e.g. 16 → 0), handle wrap-around
  if (!template) {
    return await prisma.shiftTemplate.findFirst({
      where: {
        startHour: { gt: hour },
        endHour: 0, // meaning ends at midnight or wraps
      },
    });
  }

  return template;
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

export async function getCurrentShift() {
  const now = dayjs();

  const currentShift = await prisma.shift.findFirst({
    where: {
      startTime: { lte: now.toDate() }, // started already
      OR: [
        { endTime: null }, // not finished
        { endTime: { isSet: false } }, // not finished
        { endTime: { gt: now.toDate() } }, // still active
      ],
    },
    include: { template: true },
    orderBy: { startTime: "desc" },
  });
  return currentShift;
}
