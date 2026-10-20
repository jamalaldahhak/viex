
import RolePermission from "../models/RolePermission.js";

export async function assignPermission(roleId, permissionId) {
  return RolePermission.create({
    roleId,
    permissionId,
  });
}

export async function removePermission(roleId, permissionId) {
  return RolePermission.findOneAndDelete({
    roleId,
    permissionId,
  });
}

export async function findByRoleId(roleId) {
  return RolePermission.find({ roleId })
    .populate("permissionId");
}

export async function findByPermissionId(permissionId) {
  return RolePermission.find({ permissionId })
    .populate("roleId");
}

export async function findPermissionIdsByRoleIds(roleIds) {
  const assignments = await RolePermission.find({
    roleId: { $in: roleIds },
  }).select("permissionId");

  return [
    ...new Set(
      assignments.map((item) => item.permissionId.toString())
    ),
  ];
}

export async function removeAllForRole(roleId) {
  return RolePermission.deleteMany({ roleId });
}

export async function removeAllForPermission(permissionId) {
  return RolePermission.deleteMany({ permissionId });
}
