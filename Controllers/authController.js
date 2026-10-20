import * as authService from "../services/authService.js";

import {
  registerSchema,
  loginSchema,
} from "../Validation/authValidator.js";

function sendValidationError(res, validation) {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: validation.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, refreshCookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
  });
}

export async function register(req, res, next) {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return sendValidationError(res, validation);
    }

    const result = await authService.register(validation.data);

    setRefreshCookie(res, result.refreshToken);

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: {
        user: result.user,
        roles: result.roles,
        permissions: result.permissions,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return sendValidationError(res, validation);
    }

    const result = await authService.login(validation.data);

    setRefreshCookie(res, result.refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        roles: result.roles,
        permissions: result.permissions,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const result = await authService.refreshSession(
      req.cookies?.refreshToken
    );

    setRefreshCookie(res, result.refreshToken);

    return res.status(200).json({
      success: true,
      message: "Session refreshed successfully",
      data: {
        user: result.user,
        roles: result.roles,
        permissions: result.permissions,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    clearRefreshCookie(res);
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logout(req.cookies?.refreshToken);

    clearRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const result = await authService.getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}