const jwt = require("jsonwebtoken");

const signAccessToken = (payload) => {
  const isAdmin = payload && payload.role === "admin";
  const isPendingMfa = payload && payload.mfaStage === "pending";

  // MFA pending tokens should expire in 15m for security
  if (isPendingMfa) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
  }

  // Admin tokens: no timeout by default ("never"), or use ADMIN_TOKEN_TTL if specified
  if (isAdmin) {
    const adminTtl = (process.env.ADMIN_TOKEN_TTL || "never").toLowerCase();
    if (adminTtl === "never" || adminTtl === "none" || adminTtl === "0") {
      return jwt.sign(payload, process.env.JWT_ACCESS_SECRET);
    }
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ADMIN_TOKEN_TTL });
  }

  // Standard user tokens: default to 30d or ACCESS_TOKEN_TTL
  const userTtl = (process.env.ACCESS_TOKEN_TTL || "30d").toLowerCase();
  if (userTtl === "never" || userTtl === "none") {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET);
  }
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TTL || "30d" });
};

const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_TTL || "90d" });

const verifyAccess = (token) => jwt.verify(token, process.env.JWT_ACCESS_SECRET);
const verifyRefresh = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);

module.exports = { signAccessToken, signRefreshToken, verifyAccess, verifyRefresh };