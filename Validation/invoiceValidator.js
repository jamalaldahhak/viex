
import { z } from "zod";

function normalizeInvoiceFields(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return input;
  }

  const data = { ...input };

  data.userId ??= data.USER_ID ?? data.user_id;
  data.courseId ??= data.COURSE_ID ?? data.course_id;
  data.amount ??= data.AMOUNT;
  data.receiptNumber ??= data.receipt_number ?? data["رقم الوصل"];

  delete data.USER_ID;
  delete data.user_id;
  delete data.COURSE_ID;
  delete data.course_id;
  delete data.AMOUNT;
  delete data.receipt_number;
  delete data["رقم الوصل"];

  return data;
}

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid MongoDB ID");

const invoiceFields = {
  userId: objectIdSchema,
  courseId: objectIdSchema,
  amount: z.coerce.number().finite().positive(),
  receiptNumber: z.string().trim().min(1).max(100),
};

export const createInvoiceSchema = z.preprocess(
  normalizeInvoiceFields,
  z.object(invoiceFields)
);

export const updateInvoiceSchema = z.preprocess(
  normalizeInvoiceFields,
  z
    .object({
      userId: invoiceFields.userId.optional(),
      courseId: invoiceFields.courseId.optional(),
      amount: invoiceFields.amount.optional(),
      receiptNumber: invoiceFields.receiptNumber.optional(),
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      "Provide at least one field to update"
    )
);

export const invoiceIdSchema = z.object({
  id: objectIdSchema,
});

export const invoiceListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
