
import mongoose from "mongoose";

const userRoleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent assigning the same role to the same user twice.
userRoleSchema.index(
  { userId: 1, roleId: 1 },
  { unique: true }
);

// Find all users assigned to a specific role.
userRoleSchema.index({ roleId: 1 });

const UserRole = mongoose.model("UserRole", userRoleSchema);

export default UserRole;
