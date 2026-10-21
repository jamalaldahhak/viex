import { Router } from "express";

import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourse,
} from "../Controllers/courseController.js";
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

export default router;
