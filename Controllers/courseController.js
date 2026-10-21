import Course from "../Models/Course.js";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../Validation/courseValidator.js";

function sendNotFound(res) {
  return res.status(404).json({
    success: false,
    message: "Course not found",
  });
}

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

export async function createCourse(req, res, next) {
  try {
    const validation = createCourseSchema.safeParse(req.body);

    if (!validation.success) {
      return sendValidationError(res, validation);
    }

    const course = await Course.create(validation.data);

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: { course },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCourses(req, res, next) {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { courses },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCourseById(req, res, next) {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return sendNotFound(res);
    }

    return res.status(200).json({
      success: true,
      data: { course },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const validation = updateCourseSchema.safeParse(req.body);

    if (!validation.success) {
      return sendValidationError(res, validation);
    }

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return sendNotFound(res);
    }

    const updates = validation.data;
    const mergedValidation = createCourseSchema.safeParse({
      ...course.toObject(),
      ...updates,
    });

    if (!mergedValidation.success) {
      return sendValidationError(res, mergedValidation);
    }

    Object.assign(course, updates);
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: { course },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    const course = await Course.findByIdAndDelete(req.params.courseId);

    if (!course) {
      return sendNotFound(res);
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
