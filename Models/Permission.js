
import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
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

const Permission = mongoose.model("Permission", permissionSchema);

export default Permission;
