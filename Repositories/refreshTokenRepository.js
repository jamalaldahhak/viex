import RefreshToken from "../models/RefreshToken.js";

export async function create(data) {
  return RefreshToken.create(data);
}

export async function revokeByHash(tokenHash) {
  return RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { $set: { revokedAt: new Date() } },
    { new: true }
  );
}

export async function revokeAllForUser(userId) {
  return RefreshToken.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}
