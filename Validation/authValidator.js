import { z } from "zod";

export const registerSchema = z.object({
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

  father_number: z.string().trim().min(5).max(20),

  birthday: z.coerce.date().refine(
    (value) => value <= new Date(),
    "Birthday cannot be in the future"
  ),
});

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),

  password: z.string().min(1).max(72),
});