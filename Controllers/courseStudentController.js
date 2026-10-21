import Course from "../Models/Course.js";
import CourseStudent from "../Models/CourseStudent.js";
import StudentProfile from "../Models/StudentProfile.js";
import User from "../Models/User.js";

function sendNotFound(res, message) {
  return res.status(404).json({ success: false, message });
}

export async function enrollStudent(req, res, next) {
  try {
    const course = await Course.findById(req.params.courseId).select("_id");
    if (!course) return sendNotFound(res, "Course not found");

    const user = await User.findById(req.params.studentId).select(
      "_id isActive"
    );
    if (!user) return sendNotFound(res, "Student not found");
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "Inactive users cannot be enrolled in a course",
      });
    }

    const profile = await StudentProfile.findOne({
      userId: user._id,
      status: "active",
    }).select("_id");
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: "An active student profile is required for enrollment",
      });
    }

    const enrollment = await CourseStudent.create({
      courseId: course._id,
      studentId: user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Student enrolled successfully",
      data: { enrollment },
    });
  } catch (error) {
    next(error);
  }
}

export async function unenrollStudent(req, res, next) {
  try {
    const course = await Course.findById(req.params.courseId).select("_id");
    if (!course) return sendNotFound(res, "Course not found");

    const enrollment = await CourseStudent.findOneAndDelete({
      courseId: course._id,
      studentId: req.params.studentId,
    });
    if (!enrollment) return sendNotFound(res, "Course enrollment not found");

    return res.status(200).json({
      success: true,
      message: "Student unenrolled successfully",
    });
  } catch (error) {
    next(error);
  }
}
