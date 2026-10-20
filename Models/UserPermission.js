
import mongoose from "mongoose";

const userPermissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    permissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
      required: true,
    },

    effect: {
      type: String,
      enum: ["allow", "deny"],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// A user can have only one direct rule per permission.
userPermissionSchema.index(
  { userId: 1, permissionId: 1 },
  { unique: true }
);

// Find users assigned a specific permission.
userPermissionSchema.index({ permissionId: 1 });

const UserPermission = mongoose.model(
  "UserPermission",
  userPermissionSchema
);

export default UserPermission;
