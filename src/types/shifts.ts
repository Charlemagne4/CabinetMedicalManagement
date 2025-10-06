import z from "zod";

// 🕐 Shift Template
export const ShiftTemplateCreateSchema = z.object({
  name: z.string(),
  startHour: z.number(),
  endHour: z.number(),
  type: z.string(), // Assuming ShiftType is an enum in Prisma
});

export const ShiftTemplateUpdateSchema = z.object({
  name: z.string().optional(),
  startHour: z.number().optional(),
  endHour: z.number().optional(),
  type: z.string().optional(),
});

// 🧾 Shift
export const ShiftCreateSchema = z.object({
  userId: z.string(),
  templateId: z.string().optional(),
  startTime: z.date().optional(), // defaults to now()
  endTime: z.date().optional(),
  confirmed: z.boolean().optional(), // defaults to false
});

export const ShiftUpdateSchema = z.object({
  userId: z.string().optional(),
  templateId: z.string().nullable().optional(),
  startTime: z.date().optional(),
  endTime: z.date().nullable().optional(),
  confirmed: z.boolean().optional(),
});
