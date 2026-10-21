import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import UserRole from "../models/UserRole.js";
import RolePermission from "../models/RolePermission.js";
const permissionsToCreate = [
  {
    name: "invoices.create",
    description: "Create invoices",
  },
  {
    name: "invoices.read",
    description: "View invoices",
  },
  {
    name: "invoices.update",
    description: "Update invoices",
  },
  {
    name: "invoices.delete",
    description: "Delete invoices",
  },
];
const requiredEnv = [
  "MONGODB_URI",
  "ADMIN_NAME",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_PHONE",
  "ADMIN_GENDER",
  "ADMIN_NATIONALITY",
];

async function createAdmin() {
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }

  if (Buffer.byteLength(process.env.ADMIN_PASSWORD, "utf8") > 72) {
    throw new Error("ADMIN_PASSWORD must not exceed 72 UTF-8 bytes");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  // 1. إنشاء الأدوار الأساسية إذا لم تكن موجودة
  const roleNames = ["admin", "student", "teacher", "employee"];

  for (const name of roleNames) {
    await Role.findOneAndUpdate(
      { name },
      { $setOnInsert: { name } },
      { upsert: true, new: true, runValidators: true }
    );
  }

  const adminRole = await Role.findOne({ name: "admin" });

  // 2. إنشاء الصلاحيات الأساسية إذا لم تكن موجودة
  const permissionNames = [
    "students.create",
    "teachers.create",
    "employees.create",
  ];

  for (const name of permissionNames) {
    await Permission.findOneAndUpdate(
      { name },
      { $setOnInsert: { name } },
      { upsert: true, new: true, runValidators: true }
    );
  }

  // 3. إسناد جميع الصلاحيات الموجودة إلى admin
  const allPermissions = await Permission.find({});

  for (const permission of allPermissions) {
    await RolePermission.findOneAndUpdate(
      {
        roleId: adminRole._id,
        permissionId: permission._id,
      },
      {
        $setOnInsert: {
          roleId: adminRole._id,
          permissionId: permission._id,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );
  }

  // 4. إنشاء حساب المدير إذا لم يكن موجوداً
  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();

  let adminUser = await User.findOne({ email });

  if (!adminUser) {
    const password = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      12
    );

    adminUser = await User.create({
      full_name: process.env.ADMIN_NAME,
      email,
      password,
      number_phone: process.env.ADMIN_PHONE,
      gender: process.env.ADMIN_GENDER,
      nationality: process.env.ADMIN_NATIONALITY,
      isActive: true,
    });

    console.log("Admin user created");
  } else {
    console.log(
      "Admin email already exists. Existing password was not changed."
    );
  }

  // 5. إسناد دور admin للحساب
  await UserRole.findOneAndUpdate(
    {
      userId: adminUser._id,
      roleId: adminRole._id,
    },
    {
      $setOnInsert: {
        userId: adminUser._id,
        roleId: adminRole._id,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );

  // 6. التحقق من وجود صلاحيات الإنشاء الأساسية
  const adminPermissionLinks = await RolePermission.countDocuments({
    roleId: adminRole._id,
    permissionId: { $in: allPermissions.map((p) => p._id) },
  });

  console.log("--------------------------------");
  console.log("Admin setup completed");
  console.log("Email:", email);
  console.log("Role: admin");
  console.log("Permissions linked:", adminPermissionLinks);
  console.log("--------------------------------");
}

createAdmin()
  .catch((error) => {
    console.error("Failed to create admin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });