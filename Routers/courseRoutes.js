import { Router } from "express";

import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourse,
} from "../Controllers/courseController.js";
import {
  addChoice,
  addQuestion,
  createQuiz,
  deleteChoice,
  deleteQuestion,
  deleteQuiz,
  getCourseQuizzes,
  getQuizById,
  updateChoice,
  updateQuestion,
  updateQuiz,
} from "../Controllers/quizController.js";
import {
  enrollStudent,
  unenrollStudent,
} from "../Controllers/courseStudentController.js";
import { authenticateToken } from "../Middlewares/authenticateToken.js";
import { authorize } from "../Middlewares/authorize.js";

const router = Router();

router.use(authenticateToken);

router
  .route("/")
  .get(authorize("courses.view"), getCourses)
  .post(authorize("courses.create"), createCourse);

router
  .route("/:courseId")
  .get(authorize("courses.view"), getCourseById)
  .patch(authorize("courses.update"), updateCourse)
  .delete(authorize("courses.delete"), deleteCourse);

router
  .route("/:courseId/quizzes")
  .get(authorize("quizzes.view"), getCourseQuizzes)
  .post(authorize("quizzes.create"), createQuiz);

router
  .route("/:courseId/quizzes/:quizId")
  .get(authorize("quizzes.view"), getQuizById)
  .patch(authorize("quizzes.update"), updateQuiz)
  .delete(authorize("quizzes.delete"), deleteQuiz);

router
  .route("/:courseId/quizzes/:quizId/questions")
  .post(authorize("quizzes.update"), addQuestion);

router
  .route("/:courseId/quizzes/:quizId/questions/:questionId")
  .patch(authorize("quizzes.update"), updateQuestion)
  .delete(authorize("quizzes.update"), deleteQuestion);

router
  .route("/:courseId/quizzes/:quizId/questions/:questionId/choices")
  .post(authorize("quizzes.update"), addChoice);

router
  .route("/:courseId/quizzes/:quizId/questions/:questionId/choices/:choiceIndex")
  .patch(authorize("quizzes.update"), updateChoice)
  .delete(authorize("quizzes.update"), deleteChoice);

router
  .route("/:courseId/students/:studentId")
  .post(authorize("course_students.manage"), enrollStudent)
  .delete(authorize("course_students.manage"), unenrollStudent);

export default router;
