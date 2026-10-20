
import mongoose from "mongoose";

const rolePermissionSchema = new mongoose.Schema(
  {
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },

    permissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

rolePermissionSchema.index(
  { roleId: 1, permissionId: 1 },
  { unique: true }
);

rolePermissionSchema.index({ permissionId: 1 });

const RolePermission = mongoose.model(
  "RolePermission",
  rolePermissionSchema
);

export default RolePermission;
