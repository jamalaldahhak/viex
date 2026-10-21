import Course from "../Models/Course.js";
import Quiz from "../Models/Quiz.js";
import { createQuizSchema } from "../Validation/quizValidator.js";

export async function createQuiz(req, res, next) {
  try {
    const validation = createQuizSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

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
