import { z } from "zod";

const courseFields = {
  title: z
    .string()
    .trim()
    .min(2, "Course title must be at least 2 characters")
    .max(20, "Course title cannot exceed 20 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Course description cannot exceed 1000 characters")
    .optional(),
  price: z.number().min(0, "Course price cannot be negative").optional(),
  start_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must use HH:mm format")
    .optional(),
  end_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "End time must use HH:mm format")
    .optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
};

function validateCourseRanges(course, context) {
  if (
    course.start_time &&
    course.end_time &&
    course.end_time <= course.start_time
  ) {
    context.addIssue({
      code: "custom",
      path: ["end_time"],
      message: "End time must be later than start time",
    });
  }

  if (
    course.start_date &&
    course.end_date &&
    course.end_date < course.start_date
  ) {
    context.addIssue({
      code: "custom",
      path: ["end_date"],
      message: "End date must be on or after start date",
    });
  }
}

export const createCourseSchema = z
  .object(courseFields)
  .superRefine(validateCourseRanges);

export const updateCourseSchema = z
  .object(courseFields)
  .partial()
  .superRefine((course, context) => {
    if (Object.keys(course).length === 0) {
      context.addIssue({
        code: "custom",
        message: "At least one course field must be provided",
      });
    }

    validateCourseRanges(course, context);
  });
