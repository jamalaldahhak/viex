import bcrypt from "bcryptjs";

import * as userRepository from "../repositories/userRepository.js";
import * as profileRepository from "../repositories/profileRepository.js";
import * as roleRepository from "../repositories/roleRepository.js";
import * as userRoleService from "./userRoleService.js";
import * as permissionService from "./permissionService.js";

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function checkCreatorPermission(actorId, permissionName) {
  if (!actorId) {
    throw createError("Authentication required", 401);
  }

  const allowed = await permissionService.hasPermission(
    actorId,
    permissionName
  );

  if (!allowed) {
    throw createError("You do not have permission to perform this action", 403);
  }
}

async function createUserAndProfile({
  data,
  roleName,
  profileCreator,
  profileDeleter,
}) {
  const {
    full_name,
    email,
    password,
    number_phone,
    gender,
    nationality,
    ...profileData
  } = data;

  if (Buffer.byteLength(password, "utf8") > 72) {
    throw createError("Password must not exceed 72 UTF-8 bytes", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (await userRepository.existsByEmail(normalizedEmail)) {
    throw createError("Email is already registered", 409);
  }

  const role = await roleRepository.findByName(roleName);

  if (!role) {
    throw createError(`Role "${roleName}" is not configured`, 500);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  let user;
  let roleAssigned = false;

  try {
    user = await userRepository.create({
      full_name,
      email: normalizedEmail,
      password: hashedPassword,
      number_phone,
      gender,
      nationality,
    });

    await userRoleService.assignRoleToUser(user._id, role._id);
    roleAssigned = true;

    await profileCreator({
      userId: user._id,
      ...profileData,
    });

    return {
      id: user._id.toString(),
      full_name: user.full_name,
      email: user.email,
      isActive: user.isActive,
      roles: [role.name],
    };
  } catch (error) {
    // تعويض عند فشل إنشاء الدور أو البروفايل.
    // في الإنتاج يفضّل استخدام MongoDB transaction على Replica Set.
    if (user?._id) {
      try {
        await profileDeleter(user._id);

        if (roleAssigned) {
          await userRoleService.removeRoleFromUser(
            user._id,
            role._id
          );
        }

        await userRepository.deleteById(user._id);
      } catch (cleanupError) {
        console.error("User creation cleanup failed:", cleanupError);
      }
    }

    if (error.code === 11000) {
      throw createError("Email or profile already exists", 409);
    }

    throw error;
  }
}

export async function createStudent(data, actorId) {
  await checkCreatorPermission(actorId, "students.create");

  return createUserAndProfile({
    data: {
      ...data,
      status: "active",
    },
    roleName: "student",
    profileCreator: profileRepository.createStudentProfile,
    profileDeleter: profileRepository.deleteStudentProfile,
  });
}

export async function createTeacher(data, actorId) {
  await checkCreatorPermission(actorId, "teachers.create");

  return createUserAndProfile({
    data,
    roleName: "teacher",
    profileCreator: profileRepository.createTeacherProfile,
    profileDeleter: profileRepository.deleteTeacherProfile,
  });
}

export async function createEmployee(data, actorId) {
  await checkCreatorPermission(actorId, "employees.create");

  return createUserAndProfile({
    data,
    roleName: "employee",
    profileCreator: profileRepository.createEmployeeProfile,
    profileDeleter: profileRepository.deleteEmployeeProfile,
  });
}