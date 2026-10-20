
import * as roleRepository from "../repositories/roleRepository.js";
import * as permissionRepository from "../repositories/permissionRepository.js";
import * as rolePermissionRepository from "../repositories/rolePermissionRepository.js";
import * as userRoleRepository from "../repositories/userRoleRepository.js";

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function createRole(data) {
  const name = data.name.toLowerCase().trim();

  const existingRole = await roleRepository.findByName(name);

  if (existingRole) {
    throw createError("Role already exists", 409);
  }

  return roleRepository.create({
    name,
    description: data.description ?? "",
  });
}

export async function assignPermissionToRole(roleId, permissionId) {
  const role = await roleRepository.findById(roleId);

  if (!role) {
    throw createError("Role not found", 404);
  }

  const permission =
    await permissionRepository.findById(permissionId);

  if (!permission) {
    throw createError("Permission not found", 404);
  }

  const existing = await rolePermissionRepository.findByRoleId(roleId);

  if (
    existing.some(
      (item) =>
        item.permissionId?._id?.toString() ===
        permissionId.toString()
    )
  ) {
    throw createError("Permission is already assigned to this role", 409);
  }

  return rolePermissionRepository.assignPermission(
    roleId,
    permissionId
  );
}

export async function removePermissionFromRole(roleId, permissionId) {
  const role = await roleRepository.findById(roleId);

  if (!role) {
    throw createError("Role not found", 404);
  }

  return rolePermissionRepository.removePermission(
    roleId,
    permissionId
  );
}

export async function deleteRole(roleId) {
  const role = await roleRepository.findById(roleId);

  if (!role) {
    throw createError("Role not found", 404);
  }

  // Remove relationships before deleting the role.
  await rolePermissionRepository.removeAllForRole(roleId);
  await userRoleRepository.removeAllForRole(roleId);

  return roleRepository.deleteById(roleId);
}
