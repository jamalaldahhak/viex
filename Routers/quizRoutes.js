import { Router } from "express";

import {
  getMyQuizAttempt,
  submitQuizAttempt,
} from "../Controllers/quizController.js";
import { authenticateToken } from "../Middlewares/authenticateToken.js";
import { authorize } from "../Middlewares/authorize.js";

const router = Router();

router.use(authenticateToken);

router
  .route("/:quizId/attempts")
  .post(authorize("quizzes.submit"), submitQuizAttempt);

router
  .route("/:quizId/attempts/me")
  .get(authorize("quizzes.submit"), getMyQuizAttempt);

export default router;
