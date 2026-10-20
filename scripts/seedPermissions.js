
import "dotenv/config";
import mongoose from "mongoose";

import { connectDB } from "../Config/mongoDBConnect.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import RolePermission from "../models/RolePermission.js";

import {
  PERMISSION_CATALOG,
  DEFAULT_ROLE_PERMISSIONS,
} from "../Config/permissionCatalog.js";

const ROLE_CATALOG = [
  {
    name: "admin",
    description: "Administrator with all system permissions",
  },
  {
    name: "employee",
    description: "Employee with permissions assigned by administrator",
  },
  {
    name: "student",
    description: "Student with default student permissions",
  },
  {
    name: "teacher",
    description: "Teacher with default teacher permissions",
  },
];

async function seedPermissions() {
  try {
    await connectDB();

    console.log("Starting permissions seed...");

    // 1. Create or update permissions.
    for (const permissionData of PERMISSION_CATALOG) {
      await Permission.updateOne(
        { name: permissionData.name },
        {
          $set: {
            description: permissionData.description,
          },
          $setOnInsert: {
            name: permissionData.name,
          },
        },
        { upsert: true }
      );
    }

    console.log(`${PERMISSION_CATALOG.length} permissions processed.`);

    // 2. Create or update roles.
    for (const roleData of ROLE_CATALOG) {
      await Role.updateOne(
        { name: roleData.name },
        {
          $set: {
            description: roleData.description,
          },
          $setOnInsert: {
            name: roleData.name,
          },
        },
        { upsert: true }
      );
    }

    console.log(`${ROLE_CATALOG.length} roles processed.`);

    // 3. Link permissions to each role.
    for (const [roleName, permissionNames] of Object.entries(
      DEFAULT_ROLE_PERMISSIONS
    )) {
      const role = await Role.findOne({ name: roleName });

      if (!role) {
        throw new Error(`Role "${roleName}" was not found.`);
      }

      const permissions = await Permission.find({
        name: { $in: permissionNames },
      }).select("_id name");

      const foundNames = new Set(
        permissions.map((permission) => permission.name)
      );

      const missingNames = permissionNames.filter(
        (name) => !foundNames.has(name)
      );

      if (missingNames.length > 0) {
        throw new Error(
          `Missing permissions for "${roleName}": ${missingNames.join(", ")}`
        );
      }

      for (const permission of permissions) {
        await RolePermission.updateOne(
          {
            roleId: role._id,
            permissionId: permission._id,
          },
          {
            $setOnInsert: {
              roleId: role._id,
              permissionId: permission._id,
            },
          },
          { upsert: true }
        );
      }

      console.log(
        `Role "${roleName}": ${permissions.length} permissions linked.`
      );
    }

    console.log("Permissions and roles seeded successfully.");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedPermissions();
