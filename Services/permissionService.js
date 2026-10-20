
import * as userRepository from "../repositories/userRepository.js";
import * as userRoleRepository from "../repositories/userRoleRepository.js";
import * as rolePermissionRepository from "../repositories/rolePermissionRepository.js";
import * as userPermissionRepository from "../repositories/userPermissionRepository.js";
import * as permissionRepository from "../repositories/permissionRepository.js";

export async function getEffectivePermissions(userId) {
  const user = await userRepository.findById(userId);

  if (!user || !user.isActive) {
    const error = new Error("User not found or inactive");
    error.status = 403;
    throw error;
  }

  // 1. Get all roles assigned to the user.
  const userRoles = await userRoleRepository.findByUserId(userId);

  const roleIds = userRoles
    .map((assignment) => assignment.roleId?._id)
    .filter(Boolean);

  // 2. Get permissions inherited from those roles.
  const rolePermissionIds =
    await rolePermissionRepository.findPermissionIdsByRoleIds(
      roleIds
    );

  // 3. Get direct allow/deny rules for the user.
  const directRules =
    await userPermissionRepository.findRulesByUserId(userId);

  const allowedDirectly = new Set();
  const deniedDirectly = new Set();

  for (const rule of directRules) {
    const permissionId = rule.permissionId.toString();

    if (rule.effect === "deny") {
      deniedDirectly.add(permissionId);
      allowedDirectly.delete(permissionId);
    } else if (
      rule.effect === "allow" &&
      !deniedDirectly.has(permissionId)
    ) {
      allowedDirectly.add(permissionId);
    }
  }

  // 4. Combine role permissions and direct allows.
  const effectivePermissionIds = new Set([
    ...rolePermissionIds,
    ...allowedDirectly,
  ]);

  // 5. Direct deny always overrides other grants.
  for (const permissionId of deniedDirectly) {
    effectivePermissionIds.delete(permissionId);
  }

  // 6. Resolve IDs into permission names.
  const permissions = await permissionRepository.findByIds(
    [...effectivePermissionIds]
  );

  return permissions.map((permission) => permission.name);
}

export async function hasPermission(userId, permissionName) {
  const permissions = await getEffectivePermissions(userId);

  return permissions.includes(
    permissionName.toLowerCase().trim()
  );
}

export async function hasAllPermissions(userId, permissionNames) {
  const permissions = await getEffectivePermissions(userId);
  const permissionSet = new Set(permissions);

  return permissionNames.every((name) =>
    permissionSet.has(name.toLowerCase().trim())
  );
}

export async function hasAnyPermission(userId, permissionNames) {
  const permissions = await getEffectivePermissions(userId);
  const permissionSet = new Set(permissions);

  return permissionNames.some((name) =>
    permissionSet.has(name.toLowerCase().trim())
  );
}
