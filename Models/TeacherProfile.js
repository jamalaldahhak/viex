import mongoose from "mongoose";

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    certificateImage: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("TeacherProfile", teacherProfileSchema);