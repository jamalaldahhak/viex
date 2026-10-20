import * as permissionService from "../services/permissionService.js";

export function authorize(permissionName) {
  return async function (req, res, next) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const allowed = await permissionService.hasPermission(
        req.user.id,
        permissionName
      );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "Permission denied",
          requiredPermission: permissionName,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}