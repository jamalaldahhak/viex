import * as userService from "../services/userService.js";

import {
  createStudentSchema,
  createTeacherSchema,
  createEmployeeSchema,
} from "../Validation/userValidator.js";
import {getCurrentUser} from "../services/authService.js";
function createHandler(schema, serviceMethod, message) {
  return async function (req, res, next) {
    try {
      const validation = schema.safeParse(req.body);

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

      const user = await serviceMethod(
        validation.data,
        req.user.id
      );

      return res.status(201).json({
        success: true,
        message,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const createStudent = createHandler(
  createStudentSchema,
  userService.createStudent,
  "Student created successfully"
);

export const createTeacher = createHandler(
  createTeacherSchema,
  userService.createTeacher,
  "Teacher created successfully"
);

export const createEmployee = createHandler(
  createEmployeeSchema,
  userService.createEmployee,
  "Employee created successfully"
);

export async function me(req, res, next) {
  try {
    console.log("Authenticated user ID:", req.user?.id);

    const data = await getCurrentUser(req.user.id);

    console.log("Current user data:", data);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("ME endpoint error:", error);
    next(error);
  }
}