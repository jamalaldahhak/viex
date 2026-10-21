import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    choices: {
      type: [
        {
          type: String,
          trim: true,
          required: true,
        },
      ],
      required: true,
      validate: {
        validator(choices) {
          return choices.length >= 2 && choices.length <= 6;
        },
        message: "Each question must have between 2 and 6 choices",
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, "Correct answer is required"],
      min: [0, "Correct answer must be a valid choice index"],
      validate: {
        validator(value) {
          return value < this.choices.length;
        },
        message: "Correct answer must refer to an existing choice",
      },
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Quiz name is required"],
      trim: true,
      maxlength: [100, "Quiz name cannot exceed 100 characters"],
    },
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      maxlength: [200, "Quiz title cannot exceed 200 characters"],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
      index: true,
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Quiz", quizSchema);
