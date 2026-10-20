
import UserRole from "../models/UserRole.js";

export async function assignRole(userId, roleId) {
  return UserRole.create({
    userId,
    roleId,
  });
}

export async function removeRole(userId, roleId) {
  return UserRole.findOneAndDelete({
    userId,
    roleId,
  });
}

export async function findByUserId(userId) {
  return UserRole.find({ userId })
    .populate("roleId");
}

export async function findByRoleId(roleId) {
  return UserRole.find({ roleId })
    .populate("userId", "name email isActive");
}

export async function hasRole(userId, roleId) {
  const assignment = await UserRole.exists({
    userId,
    roleId,
  });

  return Boolean(assignment);
}

export async function removeAllForUser(userId) {
  return UserRole.deleteMany({ userId });
}

export async function removeAllForRole(roleId) {
  return UserRole.deleteMany({ roleId });
}
