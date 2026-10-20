
import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 50,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Role = mongoose.model("Role", roleSchema);

export default Role;
