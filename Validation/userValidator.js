import { z } from "zod";

const commonFields = {
  full_name: z.string().trim().min(2).max(100),

  email: z.string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),

  password: z.string().min(8).max(72),

  number_phone: z.string().trim().min(5).max(20),

  gender: z.enum(["male", "female"]),

  nationality: z.string().trim().min(2).max(100),
};

export const createStudentSchema = z.object({
  ...commonFields,
  father_number: z.string().trim().min(5).max(20),
  birthday: z.coerce.date().refine(
    (value) => value <= new Date(),
    "Birthday cannot be in the future"
  ),
});

export const createTeacherSchema = z.object({
  ...commonFields,
  salary: z.coerce.number().min(0),
  specialization: z.string().trim().min(2).max(150),
  certificateImage: z.string().trim().min(1).max(1000),
});

export const createEmployeeSchema = z.object({
  ...commonFields,
  salary: z.coerce.number().min(0),
  address: z.string().trim().min(3).max(300),
  identityImage: z.string().trim().min(1).max(1000),
});