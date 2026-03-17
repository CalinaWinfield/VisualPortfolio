const { verifyAccess } = require("../models/jwt");

module.exports = function auth(requiredRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    try {
      const payload = verifyAccess(token);
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = payload; // { sub, email, role }
      next();
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
};