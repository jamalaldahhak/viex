import UserPermission from "../models/UserPermission.js";

export async function setDirectPermission(
  userId,
  permissionId,
  effect
) {
  return UserPermission.findOneAndUpdate(
    { userId, permissionId },
    { $set: { effect } },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
}

export async function removeDirectPermission(
  userId,
  permissionId
) {
  return UserPermission.findOneAndDelete({
    userId,
    permissionId,
  });
}

export async function findByUserId(userId) {
  return UserPermission.find({ userId })
    .populate("permissionId");
}

export async function findRulesByUserId(userId) {
  return UserPermission.find({ userId })
    .select("permissionId effect");
}

export async function findDirectPermission(
  userId,
  permissionId
) {
  return UserPermission.findOne({
    userId,
    permissionId,
  });
}

export async function removeAllForUser(userId) {
  return UserPermission.deleteMany({ userId });
}

export async function removeAllForPermission(permissionId) {
  return UserPermission.deleteMany({ permissionId });
}
