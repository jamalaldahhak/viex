import mongoose from "mongoose";
import { z } from "zod";

import Course from "../Models/Course.js";
import CourseStudent from "../Models/CourseStudent.js";
import Quiz from "../Models/Quiz.js";
import QuizAttempt from "../Models/QuizAttempt.js";
import * as permissionService from "../Services/permissionService.js";
import {
  createChoiceSchema,
  createQuizSchema,
  questionSchema,
  submitAttemptSchema,
  updateQuestionSchema,
  updateQuizSchema,
} from "../Validation/quizValidator.js";

function sendValidationError(res, validation) {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: validation.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });
}

function sendNotFound(res, message) {
  return res.status(404).json({ success: false, message });
}

function sendConflict(res, message) {
  return res.status(409).json({ success: false, message });
}

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function getCourseQuiz(courseId, quizId) {
  const course = await Course.findById(courseId).select("_id");
  if (!course) return { course: null, quiz: null };

  const quiz = await Quiz.findOne({ _id: quizId, courseId: course._id });
  return { course, quiz };
}

async function ensureEnrollment(courseId, studentId) {
  const enrolled = await CourseStudent.exists({ courseId, studentId });
  if (!enrolled) {
    throw createError("You must be enrolled in this course to access its quizzes", 403);
  }
}

async function ensureQuizUnattempted(quizId) {
  const hasAttempts = await QuizAttempt.exists({ quizId });
  if (hasAttempts) {
    throw createError(
      "Quiz questions cannot be changed after a student has submitted an attempt",
      409
    );
  }
}

function quizForStudent(quiz) {
  const data = quiz.toObject();
  data.questions = data.questions.map(({ correctAnswer, ...question }) => question);
  return data;
}

async function canManageQuizzes(userId) {
  return permissionService.hasPermission(userId, "quizzes.update");
}

export async function createQuiz(req, res, next) {
  try {
    const validation = createQuizSchema.safeParse(req.body);
    if (!validation.success) return sendValidationError(res, validation);

    const course = await Course.findById(req.params.courseId).select("_id");
    if (!course) return sendNotFound(res, "Course not found");

    const quiz = await Quiz.create({
      ...validation.data,
      courseId: course._id,
    });

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: { quiz },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCourseQuizzes(req, res, next) {
  try {
    const course = await Course.findById(req.params.courseId).select("_id");
    if (!course) return sendNotFound(res, "Course not found");

    const canManage = await canManageQuizzes(req.user.id);
    if (!canManage) {
      await ensureEnrollment(course._id, req.user.id);
    }

    const quizzes = await Quiz.find({ courseId: course._id }).sort({
      createdAt: -1,
    });
    const data = canManage ? quizzes : quizzes.map(quizForStudent);

    return res.status(200).json({ success: true, data: { quizzes: data } });
  } catch (error) {
    next(error);
  }
}

export async function getQuizById(req, res, next) {
  try {
    const { course, quiz } = await getCourseQuiz(
      req.params.courseId,
      req.params.quizId
    );
    if (!course) return sendNotFound(res, "Course not found");
    if (!quiz) return sendNotFound(res, "Quiz not found");

    if (!(await canManageQuizzes(req.user.id))) {
      await ensureEnrollment(course._id, req.user.id);
      return res.status(200).json({
        success: true,
        data: { quiz: quizForStudent(quiz) },
      });
    }

    return res.status(200).json({ success: true, data: { quiz } });
  } catch (error) {
    next(error);
  }
}

export async function updateQuiz(req, res, next) {
  try {
    const validation = updateQuizSchema.safeParse(req.body);
    if (!validation.success) return sendValidationError(res, validation);

    const { course, quiz } = await getCourseQuiz(
      req.params.courseId,
      req.params.quizId
    );
    if (!course) return sendNotFound(res, "Course not found");
    if (!quiz) return sendNotFound(res, "Quiz not found");

    Object.assign(quiz, validation.data);
    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      data: { quiz },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteQuiz(req, res, next) {
  try {
    const { course, quiz } = await getCourseQuiz(
      req.params.courseId,
      req.params.quizId
    );
    if (!course) return sendNotFound(res, "Course not found");
    if (!quiz) return sendNotFound(res, "Quiz not found");

    if (await QuizAttempt.exists({ quizId: quiz._id })) {
      return sendConflict(
        res,
        "This quiz has student results and cannot be deleted"
      );
    }

    await quiz.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function addQuestion(req, res, next) {
  try {
    const validation = questionSchema.safeParse(req.body);
    if (!validation.success) return sendValidationError(res, validation);

    const { course, quiz } = await getCourseQuiz(
      req.params.courseId,
      req.params.quizId
    );
    if (!course) return sendNotFound(res, "Course not found");
    if (!quiz) return sendNotFound(res, "Quiz not found");
    await ensureQuizUnattempted(quiz._id);

    quiz.questions.push(validation.data);
    await quiz.save();
    const question = quiz.questions[quiz.questions.length - 1];

    return res.status(201).json({
      success: true,
      message: "Question added successfully",
      data: { question },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateQuestion(req, res, next) {
  try {
    const validation = updateQuestionSchema.safeParse(req.body);
    if (!validation.success) return sendValidationError(res, validation);

    const { course, quiz } = await getCourseQuiz(
      req.params.courseId,
      req.params.quizId
    );
    if (!course) return sendNotFound(res, "Course not found");
    if (!quiz) return sendNotFound(res, "Quiz not found");

    const question = quiz.questions.id(req.params.questionId);
    if (!question) return sendNotFound(res, "Question not found");

    const merged = questionSchema.safeParse({
      text: question.text,
      choices: question.choices,
      correctAnswer: question.correctAnswer,
      ...validation.data,
    });
    if (!merged.success) return sendValidationError(res, merged);

    await ensureQuizUnattempted(quiz._id);
    Object.assign(question, merged.data);
    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: { question },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteQuestion(req, res, next) {
  try {
    const { course, quiz } = await getCourseQuiz(
      req.params.courseId,
      req.params.quizId
    );
    if (!course) return sendNotFound(res, "Course not found");
    if (!quiz) return sendNotFound(res, "Quiz not found");

    const question = quiz.questions.id(req.params.questionId);
    if (!question) return sendNotFound(res, "Question not found");
    await ensureQuizUnattempted(quiz._id);

    question.deleteOne();
    await quiz.save();
    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function addChoice(req, res, next) {
  try {
    const validation = createChoiceSchema.safeParse(req.body);
    if (!validation.success) return sendValidationError(res, validation);

    const { course, quiz } = await getCourseQuiz(
      req.params.courseId,
      req.params.quizId
    );
    if (!course) return sendNotFound(res, "Course not found");
    if (!quiz) return sendNotFound(res, "Quiz not found");

    const question = quiz.questions.id(req.params.questionId);
    if (!question) return sendNotFound(res, "Question not found");
    if (question.choices.length >= 6) {
      return sendConflict(res, "A question cannot have more than 6 choices");
    }
    await ensureQuizUnattempted(quiz._id);

    question.choices.push(validation.data.text);
    await quiz.save();
    return res.status(201).json({
      success: true,
      message: "Choice added successfully",
      data: { choices: question.choices },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateChoice(req, res, next) {
  try {
    const validation = createChoiceSchema.safeParse(req.body);
    if (!validation.success) return sendValidationError(res, validation);

    const { course, quiz } = await getCourseQuiz(
      req.params.courseId,
      req.params.quizId
    );
    if (!course) return sendNotFound(res, "Course not found");
    if (!quiz) return sendNotFound(res, "Quiz not found");

    const question = quiz.questions.id(req.params.questionId);
    if (!question) return sendNotFound(res, "Question not found");
    const choiceIndex = Number(req.params.choiceIndex);
    if (
      !Number.isInteger(choiceIndex) ||
      choiceIndex < 0 ||
      choiceIndex >= question.choices.length
    ) {
      return sendNotFound(res, "Choice not found");
    }
    await ensureQuizUnattempted(quiz._id);

    question.choices[choiceIndex] = validation.data.text;
    await quiz.save();
    return res.status(200).json({
      success: true,
      message: "Choice updated successfully",
      data: { choices: question.choices },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteChoice(req, res, next) {
  try {
    const replacementSchema = z.object({
      correctAnswer: z.number().int().min(0).optional(),
    });
    const validation = replacementSchema.safeParse(req.body ?? {});
    if (!validation.success) return sendValidationError(res, validation);

    const { course, quiz } = await getCourseQuiz(
      req.params.courseId,
      req.params.quizId
    );
    if (!course) return sendNotFound(res, "Course not found");
    if (!quiz) return sendNotFound(res, "Quiz not found");

    const question = quiz.questions.id(req.params.questionId);
    if (!question) return sendNotFound(res, "Question not found");
    const choiceIndex = Number(req.params.choiceIndex);
    if (
      !Number.isInteger(choiceIndex) ||
      choiceIndex < 0 ||
      choiceIndex >= question.choices.length
    ) {
      return sendNotFound(res, "Choice not found");
    }
    if (question.choices.length <= 2) {
      return sendConflict(res, "A question must have at least 2 choices");
    }

    let correctAnswer = question.correctAnswer;
    if (choiceIndex === correctAnswer) {
      const replacement = validation.data.correctAnswer;
      const remainingChoices = question.choices.length - 1;
      if (replacement === undefined || replacement >= remainingChoices) {
        return res.status(400).json({
          success: false,
          message:
            "Deleting the correct choice requires a replacement correctAnswer index",
        });
      }
      correctAnswer = replacement;
    } else if (choiceIndex < correctAnswer) {
      correctAnswer -= 1;
    }

    await ensureQuizUnattempted(quiz._id);
    question.choices.splice(choiceIndex, 1);
    question.correctAnswer = correctAnswer;
    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Choice deleted successfully",
      data: { choices: question.choices },
    });
  } catch (error) {
    next(error);
  }
}

export async function submitQuizAttempt(req, res, next) {
  try {
    const validation = submitAttemptSchema.safeParse(req.body);
    if (!validation.success) return sendValidationError(res, validation);

    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return sendNotFound(res, "Quiz not found");
    await ensureEnrollment(quiz.courseId, req.user.id);

    if (quiz.questions.length === 0) {
      return sendConflict(res, "This quiz has no questions yet");
    }

    const questionIds = new Set(quiz.questions.map((question) => String(question._id)));
    const submittedQuestionIds = new Set();
    for (const answer of validation.data.answers) {
      const questionId = answer.questionId.toLowerCase();
      if (!questionIds.has(questionId)) {
        return res.status(400).json({
          success: false,
          message: "An answer refers to a question that is not in this quiz",
        });
      }
      if (submittedQuestionIds.has(questionId)) {
        return res.status(400).json({
          success: false,
          message: "Each question can only be answered once",
        });
      }
      submittedQuestionIds.add(questionId);

      const question = quiz.questions.id(questionId);
      if (answer.choiceIndex >= question.choices.length) {
        return res.status(400).json({
          success: false,
          message: "An answer refers to a choice that does not exist",
        });
      }
    }

    const answersByQuestion = new Map(
      validation.data.answers.map((answer) => [
        answer.questionId.toLowerCase(),
        answer.choiceIndex,
      ])
    );
    const score = quiz.questions.reduce(
      (total, question) =>
        total +
        (answersByQuestion.get(String(question._id)) === question.correctAnswer
          ? 1
          : 0),
      0
    );

    const attempt = await QuizAttempt.create({
      quizId: quiz._id,
      studentId: req.user.id,
      answers: validation.data.answers.map((answer) => ({
        questionId: new mongoose.Types.ObjectId(answer.questionId),
        choiceIndex: answer.choiceIndex,
      })),
      score,
      totalQuestions: quiz.questions.length,
    });

    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        attemptId: attempt._id,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyQuizAttempt(req, res, next) {
  try {
    const quiz = await Quiz.findById(req.params.quizId).select("_id courseId");
    if (!quiz) return sendNotFound(res, "Quiz not found");

    const attempt = await QuizAttempt.findOne({
      quizId: quiz._id,
      studentId: req.user.id,
    }).select("score totalQuestions createdAt");
    if (!attempt) return sendNotFound(res, "Quiz attempt not found");

    return res.status(200).json({ success: true, data: { attempt } });
  } catch (error) {
    next(error);
  }
}
