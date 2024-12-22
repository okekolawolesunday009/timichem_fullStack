// middleware/roleAccess.js

const roleAccess = ({ adminOnly = false, allowedRoles = [], allowedPermissions = [] }) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Admin check
    if (adminOnly && user.role === "admin") return next();

    // Role check
    if (allowedRoles.includes(user.role)) return next();

    // Manager permission check
    if (user.role === "manager" && user.permissions) {
      const hasPermission = allowedPermissions.some((p) => user.permissions.includes(p));
      if (hasPermission) return next();
    }

    return res.status(403).json({ message: "Forbidden" });
  };
};

module.exports = roleAccess;
