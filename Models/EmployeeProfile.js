import mongoose from "mongoose";

const employeeProfileSchema = new mongoose.Schema(
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
    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 300,
    },
    identityImage: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("EmployeeProfile", employeeProfileSchema);