import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    receiptNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      unique: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

invoiceSchema.index({ userId: 1, courseId: 1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
