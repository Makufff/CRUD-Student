import { z } from "zod";

export const createStudentSchema = z.object({
  studentId: z.string().trim().min(1).max(20),
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  birthDate: z.string().min(1),
  gender: z.enum(["male", "female", "other"]),
});

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;