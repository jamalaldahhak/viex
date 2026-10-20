
import * as userRepository from "../repositories/userRepository.js";
import * as permissionRepository from "../repositories/permissionRepository.js";
import * as userPermissionRepository from "../repositories/userPermissionRepository.js";

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function setUserPermission(
  userId,
  permissionId,
  effect
) {
  if (!["allow", "deny"].includes(effect)) {
    throw createError("Effect must be allow or deny", 400);
  }

  const user = await userRepository.findById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  const permission =
    await permissionRepository.findById(permissionId);

  if (!permission) {
    throw createError("Permission not found", 404);
  }

  return userPermissionRepository.setDirectPermission(
    userId,
    permissionId,
    effect
  );
}

export async function removeUserPermission(userId, permissionId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  return userPermissionRepository.removeDirectPermission(
    userId,
    permissionId
  );
}

export async function getUserDirectPermissions(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  return userPermissionRepository.findByUserId(userId);
}
