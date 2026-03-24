// backend/routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
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

/* ---------------------------------------------
   REGISTER — MFA REQUIRED BEFORE FIRST LOGIN
---------------------------------------------- */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      mfaEnabled: false,
      mfaEnrollmentRequired: true,
      mfaSecret: null
    });

    return res.status(201).json({
      signupComplete: true,
      mfaEnrollmentRequired: true,
      userId: user._id
    });

  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({ error: "Server error during registration" });
  }
});

/* ---------------------------------------------
   LOGIN — BLOCK IF MFA NOT ENROLLED
   OR REQUIRE TOTP IF MFA ENABLED
---------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" }
    }).select("+passwordHash");

    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    // BLOCK LOGIN IF MFA ENROLLMENT NOT COMPLETE
    if (user.mfaEnrollmentRequired) {
      return res.status(403).json({
        error: "MFA enrollment required",
        redirectTo: "/enroll-mfa",
        userId: user._id
      });
    }

    // Password validation
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

    // REQUIRE TOTP IF MFA ENABLED
    if (user.mfaEnabled) {
      const tempToken = signAccessToken({
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        mfaStage: "pending"
      });

      return res.json({
        mfaRequired: true,
        tempToken,
        userId: user._id
      });
    }

    // NORMAL LOGIN (no MFA)
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

/* ---------------------------------------------
   MFA SETUP — GENERATE SECRET + QR CODE
---------------------------------------------- */
router.get("/mfa/setup/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const secret = speakeasy.generateSecret({
      name: `YourApp (${user.email})`
    });

    user.mfaSecret = secret.base32;
    await user.save();

    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ qrCode });

  } catch (e) {
    console.error("MFA setup error:", e);
    res.status(500).json({ error: "Could not generate MFA setup" });
  }
});

/* ---------------------------------------------
   VERIFY MFA SETUP — ENABLE MFA + ISSUE TOKENS
---------------------------------------------- */
router.post("/mfa/verify-setup", async (req, res) => {
  try {
    const { userId, code } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: code
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid MFA code" });
    }

    user.mfaEnabled = true;
    user.mfaEnrollmentRequired = false;
    await user.save();

    // Issue tokens now that MFA is complete
    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const refreshHash = await bcrypt.hash(refreshToken, 12);
    user.refreshTokens.push({ tokenHash: refreshHash });
    pruneRefreshTokens(user);
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      accessToken,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });

  } catch (e) {
    console.error("MFA verify error:", e);
    res.status(500).json({ error: "Could not verify MFA setup" });
  }
});

/* ---------------------------------------------
   VERIFY MFA LOGIN (TOTP)
---------------------------------------------- */
router.post("/mfa/verify-login", async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    const payload = verifyRefresh(tempToken); // or verifyAccessToken if you prefer

    const user = await User.findById(payload.sub);
    if (!user) return res.status(404).json({ error: "User not found" });

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: code
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid MFA code" });
    }

    // Issue full tokens
    const fullPayload = { sub: user._id.toString(), email: user.email, role: user.role };
    const accessToken = signAccessToken(fullPayload);
    const refreshToken = signRefreshToken(fullPayload);

    const refreshHash = await bcrypt.hash(refreshToken, 12);
    user.refreshTokens.push({ tokenHash: refreshHash });
    pruneRefreshTokens(user);
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      accessToken,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });

  } catch (e) {
    console.error("MFA login verify error:", e);
    res.status(500).json({ error: "Could not verify MFA login" });
  }
});

/* ---------------------------------------------
   REFRESH TOKEN
---------------------------------------------- */
router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: "Missing refresh token" });

    const payload = verifyRefresh(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "Invalid refresh token" });

    const matches = await Promise.all(
      (user.refreshTokens || []).map(rt => bcrypt.compare(token, rt.tokenHash))
    );
    const idx = matches.findIndex(Boolean);
    if (idx === -1) {
      user.refreshTokens = [];
      await user.save();
      clearRefreshCookie(res);
      return res.status(401).json({ error: "Refresh token invalid" });
    }

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

/* ---------------------------------------------
   LOGOUT
---------------------------------------------- */
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

    const matches = await Promise.all(
      user.refreshTokens.map(rt => bcrypt.compare(token, rt.tokenHash))
    );

    const idx = matches.findIndex(Boolean);

    if (idx !== -1) {
      user.refreshTokens.splice(idx, 1);
      pruneRefreshTokens(user);
      await user.save();
    }

    res.json({ ok: true });

  } catch {
    res.json({ ok: true });
  }
});

/* ---------------------------------------------
   ME
---------------------------------------------- */
router.get("/me", require("../middleware/auth")(), async (req, res) => {
  const user = await User.findById(req.user.sub).select("_id email name role");
  res.json({ user });
});

module.exports = router;