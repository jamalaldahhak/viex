import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    choiceIndex: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true, versionKey: false }
);

quizAttemptSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("QuizAttempt", quizAttemptSchema);
