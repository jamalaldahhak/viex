
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    number_phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      select: false,
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      trim: true,
      enum: {
        values: ["male", "female"],
        message: "Gender must be male or female",
      },
      select: false,
    },

    nationality: {
      type: String,
      required: [true, "Nationality is required"],
      trim: true,
      maxlength: [100, "Nationality cannot exceed 100 characters"],
      select: false,
    },
     isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
