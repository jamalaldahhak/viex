import { z } from "zod";

const questionSchema = z
  .object({
    text: z.string().trim().min(1, "Question text is required"),
    choices: z
      .array(z.string().trim().min(1, "Choice cannot be empty"))
      .min(2, "Each question must have at least 2 choices"),
    correctAnswer: z
      .number()
      .int("Correct answer must be a choice number starting from 0")
      .min(0, "Correct answer must be a choice number starting from 0"),
  })
  .superRefine((question, context) => {
    if (question.correctAnswer >= question.choices.length) {
      context.addIssue({
        code: "custom",
        path: ["correctAnswer"],
        message: "Correct answer must refer to an existing choice",
      });
    }
  });

export const createQuizSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Quiz name is required")
    .max(100, "Quiz name cannot exceed 100 characters"),
  title: z
    .string()
    .trim()
    .min(1, "Quiz title is required")
    .max(200, "Quiz title cannot exceed 200 characters"),
  questions: z.array(questionSchema).optional(),
});
