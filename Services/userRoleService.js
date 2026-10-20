
import * as userRepository from "../repositories/userRepository.js";
import * as roleRepository from "../repositories/roleRepository.js";
import * as userRoleRepository from "../repositories/userRoleRepository.js";

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function assignRoleToUser(userId, roleId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  if (!user.isActive) {
    throw createError("Cannot assign a role to an inactive user", 403);
  }

  const role = await roleRepository.findById(roleId);

  if (!role) {
    throw createError("Role not found", 404);
  }

  const alreadyAssigned = await userRoleRepository.hasRole(
    userId,
    roleId
  );

  if (alreadyAssigned) {
    throw createError("Role is already assigned to this user", 409);
  }

  return userRoleRepository.assignRole(userId, roleId);
}

export async function removeRoleFromUser(userId, roleId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  return userRoleRepository.removeRole(userId, roleId);
}

export async function getUserRoles(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  const assignments = await userRoleRepository.findByUserId(userId);

  return assignments
    .map((assignment) => assignment.roleId)
    .filter(Boolean);
}
import UserRole from "../models/UserRole.js";

// export async function assignRoleToUser(userId, roleId) {
//   return UserRole.findOneAndUpdate(
//     { userId, roleId },
//     { $setOnInsert: { userId, roleId } },
//     { upsert: true, new: true, runValidators: true }
//   );
// }

// export async function removeRoleFromUser(userId, roleId) {
//   return UserRole.deleteOne({ userId, roleId });
// }

// export async function getUserRoles(userId) {
//   const records = await UserRole.find({ userId })
//     .populate("roleId")
//     .lean();

//   return records
//     .map((record) => record.roleId)
//     .filter(Boolean)
//     .map((role) => ({
//       id: role._id.toString(),
//       name: role.name,
//     }));
// }