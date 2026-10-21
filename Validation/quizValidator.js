import { z } from "zod";

const questionFields = {
  text: z.string().trim().min(1, "Question text is required").max(2000),
  choices: z
    .array(z.string().trim().min(1, "Choice cannot be empty").max(500))
    .min(2, "Each question must have at least 2 choices")
    .max(6, "Each question can have at most 6 choices"),
  correctAnswer: z
    .number()
    .int("Correct answer must be a choice number starting from 0")
    .min(0, "Correct answer must be a choice number starting from 0"),
};

export const questionSchema = z
  .object(questionFields)
  .superRefine((question, context) => {
    if (question.correctAnswer >= question.choices.length) {
      context.addIssue({
        code: "custom",
        path: ["correctAnswer"],
        message: "Correct answer must refer to an existing choice",
      });
    }
  });

export const updateQuestionSchema = z
  .object(questionFields)
  .partial()
  .refine((question) => Object.keys(question).length > 0, {
    message: "At least one question field must be provided",
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

export const updateQuizSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    title: z.string().trim().min(1).max(200).optional(),
  })
  .refine((quiz) => Object.keys(quiz).length > 0, {
    message: "At least one quiz field must be provided",
  });

export const createChoiceSchema = z.object({
  text: z.string().trim().min(1, "Choice cannot be empty").max(500),
});

export const submitAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid question ID"),
        choiceIndex: z.number().int().min(0),
      })
    )
    .default([]),
});
