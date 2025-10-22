import { ConsultationType } from "@prisma/client";
import z from "zod";

// 🩺 Consultation
export const ConsultationCreateSchema = z.object({
  patient: z.string(),
  amount: z.number(),
  date: z.date().optional(), // par défaut now()
  creditId: z.string().optional(),
  shiftId: z.string().optional(),
  type: z.nativeEnum(ConsultationType),
  credit: z.boolean().optional(),
});

export const ConsultationUpdateSchema = z.object({
  patient: z.string().optional(),
  amount: z.number().optional(),
  date: z.date().optional(),
  creditId: z.string().nullable().optional(),
  shiftId: z.string().nullable().optional(),
});

// 💸 Dépense
export const DepenseCreateSchema = z.object({
  label: z.string(),
  amount: z.number(),
  date: z.date().optional(), // par défaut now()
  shiftId: z.string().optional(),
});

export const DepenseUpdateSchema = z.object({
  label: z.string().optional(),
  amount: z.number().optional(),
  date: z.date().optional(),
  shiftId: z.string().optional(),
});
