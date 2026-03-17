
// backend/routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { signAccessToken, signRefreshToken, verifyRefresh } = require("../models/jwt");

const router = express.Router();

const setRefreshCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth/refresh",
  });
};

const pruneRefreshTokens = (user, max = 5) => {
  if (!Array.isArray(user.refreshTokens)) return;
  if (user.refreshTokens.length > max) {
    user.refreshTokens = user.refreshTokens.slice(-max);
  }
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash });

    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const refreshHash = await bcrypt.hash(refreshToken, 12);
    user.refreshTokens.push({ tokenHash: refreshHash });
    pruneRefreshTokens(user);
    await user.save();

    setRefreshCookie(res, refreshToken);
    res.status(201).json({
      accessToken,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// POST /api/auth/login  (auto-migrates plain password -> passwordHash)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" }
    }).select("+passwordHash");
    
    console.log("User found:", user);

    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    console.log("Loaded hash:", user.passwordHash);
    console.log("Password entered:", password);
    let valid = false;

    if (user.passwordHash) {
      valid = await user.comparePassword(password);
    } else if (user.password) {
      valid = user.password === password;
      if (valid) {
        user.passwordHash = await User.hashPassword(password);
        user.password = undefined;
        await user.save();
      }
    }

    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    user.loggedInAt = new Date();

    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const refreshHash = await bcrypt.hash(refreshToken, 12);
    user.refreshTokens.push({ tokenHash: refreshHash });
    pruneRefreshTokens(user);
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ error: "Server error during login" });
  }
  
});

// POST /api/auth/refresh  (rotate refresh token)
router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: "Missing refresh token" });

    const payload = verifyRefresh(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "Invalid refresh token" });

    // match provided token to stored hashes
    const matches = await Promise.all((user.refreshTokens || []).map(rt => bcrypt.compare(token, rt.tokenHash)));
    const idx = matches.findIndex(Boolean);
    if (idx === -1) {
      user.refreshTokens = [];
      await user.save();
      clearRefreshCookie(res);
      return res.status(401).json({ error: "Refresh token invalid" });
    }

    // rotate
    user.refreshTokens.splice(idx, 1);
    const newPayload = { sub: user._id.toString(), email: user.email, role: user.role };
    const newAccess = signAccessToken(newPayload);
    const newRefresh = signRefreshToken(newPayload);
    const newHash = await bcrypt.hash(newRefresh, 12);
    user.refreshTokens.push({ tokenHash: newHash });
    pruneRefreshTokens(user);
    await user.save();

    setRefreshCookie(res, newRefresh);
    res.json({ accessToken: newAccess });
  } catch (e) {
    console.error("Refresh error:", e);
    res.status(401).json({ error: "Could not refresh" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    clearRefreshCookie(res);

    if (!token) return res.json({ ok: true });

    const { sub } = verifyRefresh(token);
    const user = await User.findById(sub);

    if (!user || !user.refreshTokens?.length) {
      return res.json({ ok: true });
    }

    // Find the matching refresh token hash
    const matches = await Promise.all(
      user.refreshTokens.map(rt => bcrypt.compare(token, rt.tokenHash))
    );

    const idx = matches.findIndex(Boolean);

    if (idx !== -1) {
      user.refreshTokens.splice(idx, 1); // remove only this device's token
      pruneRefreshTokens(user);
      await user.save();
    }

    res.json({ ok: true });
  } catch {
    // Even if token is invalid or expired, logout should still succeed
    res.json({ ok: true });
  }
});

// GET /api/auth/me (example protected endpoint)
router.get("/me", require("../middleware/auth")(), async (req, res) => {
  const user = await User.findById(req.user.sub).select("_id email name role");
  res.json({ user });
});

module.exports = router;
