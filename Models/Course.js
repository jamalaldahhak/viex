import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [2, "Course title must be at least 2 characters"],
      maxlength: [20, "Course title cannot exceed 20 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Course description cannot exceed 1000 characters"],
      default: "",
    },
    price: {
      type: Number,
      min: [0, "Course price cannot be negative"],
    },
    start_time: {
      type: String,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must use HH:mm format"],
    },
    end_time: {
      type: String,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "End time must use HH:mm format"],
      validate: {
        validator(value) {
          return !value || !this.start_time || value > this.start_time;
        },
        message: "End time must be later than start time",
      },
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
      validate: {
        validator(value) {
          return !value || !this.start_date || value >= this.start_date;
        },
        message: "End date must be on or after start date",
      },
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Course", courseSchema);
