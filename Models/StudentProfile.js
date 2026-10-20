import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "graduated", "suspended"],
      default: "active",
      required: true,
    },
    father_number: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    birthday: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "Birthday cannot be in the future",
      },
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("StudentProfile", studentProfileSchema);