import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import * as userRepository from "../repositories/userRepository.js";
import * as profileRepository from "../repositories/profileRepository.js";
import * as roleRepository from "../repositories/roleRepository.js";
import * as userRoleService from "./userRoleService.js";
import * as permissionService from "./permissionService.js";
import * as refreshTokenRepository from "../repositories/refreshTokenRepository.js";

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getRefreshLifetimeMs() {
  const value = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  const match = value.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error("Invalid JWT_REFRESH_EXPIRES_IN");
  }

  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return Number(match[1]) * units[match[2]];
}

function createAccessToken(user) {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_ACCESS_SECRET must be set to a strong secret");
  }

  return jwt.sign({ sub: user._id.toString() }, secret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    algorithm: "HS256",
  });
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createPublicUser(user) {
  return {
    id: user._id.toString(),
    full_name: user.full_name,
    email: user.email,
    isActive: user.isActive,
  };
}

async function issueRefreshToken(userId) {
  const token = crypto.randomBytes(48).toString("hex");

  await refreshTokenRepository.create({
    userId,
    tokenHash: hashRefreshToken(token),
    expiresAt: new Date(Date.now() + getRefreshLifetimeMs()),
  });

  return token;
}

async function createSessionData(user) {
  const [roles, permissions] = await Promise.all([
    userRoleService.getUserRoles(user._id),
    permissionService.getEffectivePermissions(user._id),
  ]);

  return {
    user: createPublicUser(user),
    roles: roles.map((role) => role.name),
    permissions,
  };
}

export async function register({
  full_name,
  email,
  password,
  gender,
  nationality,
  number_phone,
  father_number,
  birthday,
}) {
  if (Buffer.byteLength(password, "utf8") > 72) {
    throw createError("Password must not exceed 72 UTF-8 bytes", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (await userRepository.existsByEmail(normalizedEmail)) {
    throw createError("Email is already registered", 409);
  }

  const studentRole = await roleRepository.findByName("student");

  if (!studentRole) {
    throw createError('Role "student" is not configured', 500);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  let user;
  let roleAssigned = false;
  let refreshToken;

  try {
    user = await userRepository.create({
      full_name,
      email: normalizedEmail,
      password: hashedPassword,
      gender,
      nationality,
      number_phone,
    });

    await userRoleService.assignRoleToUser(user._id, studentRole._id);
    roleAssigned = true;

    await profileRepository.createStudentProfile({
      userId: user._id,
      status: "active",
      father_number,
      birthday,
    });

    refreshToken = await issueRefreshToken(user._id);

    const session = await createSessionData(user);

    return {
      ...session,
      accessToken: createAccessToken(user),
      refreshToken,
    };
  } catch (error) {
    try {
      if (user?._id) {
        await profileRepository.deleteStudentProfile(user._id);

        if (roleAssigned) {
          await userRoleService.removeRoleFromUser(user._id, studentRole._id);
        }

        await refreshTokenRepository.revokeAllForUser(user._id);
        await userRepository.deleteById(user._id);
      }
    } catch (cleanupError) {
      console.error("Registration cleanup failed:", cleanupError);
    }

    if (error.code === 11000) {
      throw createError("Email or student profile already exists", 409);
    }

    throw error;
  }
}

export async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw createError("Account is inactive", 403);
  }

  const [session, accessToken, refreshToken] = await Promise.all([
    createSessionData(user),
    Promise.resolve(createAccessToken(user)),
    issueRefreshToken(user._id),
  ]);

  return {
    ...session,
    accessToken,
    refreshToken,
  };
}

export async function refreshSession(rawToken) {
  if (typeof rawToken !== "string" || !/^[a-f0-9]{96}$/i.test(rawToken)) {
    throw createError("Refresh token is invalid or expired", 401);
  }

  const oldToken = await refreshTokenRepository.revokeByHash(
    hashRefreshToken(rawToken),
  );

  if (!oldToken) {
    throw createError("Refresh token is invalid or expired", 401);
  }

  const user = await userRepository.findById(oldToken.userId);

  if (!user || !user.isActive) {
    throw createError("User not found or inactive", 401);
  }

  const [session, accessToken, refreshToken] = await Promise.all([
    createSessionData(user),
    Promise.resolve(createAccessToken(user)),
    issueRefreshToken(user._id),
  ]);

  return {
    ...session,
    accessToken,
    refreshToken,
  };
}

export async function logout(rawToken) {
  if (typeof rawToken !== "string" || !/^[a-f0-9]{96}$/i.test(rawToken)) {
    return;
  }

  await refreshTokenRepository.revokeByHash(hashRefreshToken(rawToken));
}

export async function getCurrentUser(userId) {
  const user = await userRepository.findById(userId);
  console.log(user);
  if (!user || !user.isActive) {
    const error = new Error("User not found or inactive");
    error.status = 401;
    throw error;
  }

  const [permissions, userRoles] = await Promise.all([
    permissionService.getEffectivePermissions(userId),
    userRoleService.getUserRoles(userId),
  ]);

  return {
    user: {
      id: user._id.toString(),
      full_name: user.full_name,
      email: user.email,
    },
    roles: userRoles.map((role) => role.name),
    permissions,
  };
}

// export async function getCurrentUser(userId) {
//   const user = await userRepository.findById(userId);

//   if (!user || !user.isActive) {
//     throw createError("User not found or inactive", 401);
//   }

//   const session = await createSessionData(user);

//   const [studentProfile, teacherProfile, employeeProfile] =
//     await Promise.all([
//       profileRepository.findStudentProfile(user._id),
//       profileRepository.findTeacherProfile(user._id),
//       profileRepository.findEmployeeProfile(user._id),
//     ]);

//   let profile = null;

//   if (studentProfile) {
//     profile = { type: "student", ...studentProfile.toObject() };
//   } else if (teacherProfile) {
//     profile = { type: "teacher", ...teacherProfile.toObject() };
//   } else if (employeeProfile) {
//     profile = { type: "employee", ...employeeProfile.toObject() };
//   }

//   return {
//     ...session,
//     profile,
//   };
// }