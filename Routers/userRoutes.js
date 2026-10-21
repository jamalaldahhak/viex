import { Router } from "express";

import {
  createStudent,
  createTeacher,
  createEmployee,
  me,
} from "../controllers/userController.js";

import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = Router();

router.use(authenticateToken);

router.post("/students", createStudent);
router.post("/teachers", createTeacher);
router.post("/employees", createEmployee);
router.get("/me", me);
export default router;