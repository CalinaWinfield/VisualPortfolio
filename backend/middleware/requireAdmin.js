// backend/middleware/requireAdmin.js
const { verifyAccess } = require('../models/jwt');

module.exports = function requireAdmin() {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const payload = verifyAccess(authHeader.split(' ')[1]);
      if (payload.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      req.user = payload;
      next();
    } catch (err) {
      if (err && err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', expired: true });
      }
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};