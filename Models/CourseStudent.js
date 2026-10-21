import mongoose from "mongoose";

const courseStudentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

courseStudentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("CourseStudent", courseStudentSchema);
