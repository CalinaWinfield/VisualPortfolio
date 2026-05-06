// testing/auth.full.test.js

/*
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

// middleware under test
const auth = require('../backend/middleware/auth');

// mocks
jest.mock('../backend/models/User');
jest.mock('bcrypt');
jest.mock('speakeasy');
jest.mock('qrcode');
jest.mock('../backend/models/jwt');

const User = require('../backend/models/User');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
  verifyAccess,
} = require('../backend/models/jwt');

const authRoutes = require('../backend/routes/authRoutes');

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRoutes);
  return app;
};

const mockReqResNext = (headers = {}) => {
  const req = { headers };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();
  return { req, res, next };
};

/* =======================================================================
   AUTH MIDDLEWARE TESTS
======================================================================= 

describe('auth middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if no token provided', () => {
    const { req, res, next } = mockReqResNext({});
    const middleware = auth();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 if token is invalid', () => {
    const { req, res, next } = mockReqResNext({
      authorization: 'Bearer invalid.token',
    });
    const middleware = auth();

    verifyAccess.mockImplementation(() => {
      throw new Error('invalid');
    });

    middleware(req, res, next);

    expect(verifyAccess).toHaveBeenCalledWith('invalid.token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches user payload and calls next for valid token', () => {
    const payload = { sub: '123', email: 'test@example.com', role: 'user' };
    verifyAccess.mockReturnValue(payload);

    const { req, res, next } = mockReqResNext({
      authorization: 'Bearer valid.token',
    });
    const middleware = auth();

    middleware(req, res, next);

    expect(verifyAccess).toHaveBeenCalledWith('valid.token');
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('denies access if role is not allowed', () => {
    const payload = { sub: '123', email: 'test@example.com', role: 'user' };
    verifyAccess.mockReturnValue(payload);

    const { req, res, next } = mockReqResNext({
      authorization: 'Bearer valid.token',
    });
    const middleware = auth(['admin']);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('allows access if role is allowed', () => {
    const payload = { sub: '123', email: 'test@example.com', role: 'admin' };
    verifyAccess.mockReturnValue(payload);

    const { req, res, next } = mockReqResNext({
      authorization: 'Bearer valid.token',
    });
    const middleware = auth(['admin']);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

/* =======================================================================
   AUTH ROUTES TESTS
======================================================================= 

describe('authRoutes', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  /* -------------------- REGISTER -------------------- 

  describe('POST /api/auth/register', () => {
    it('returns 400 if missing fields', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing fields');
    });

    it('returns 409 if email already registered', async () => {
      User.findOne.mockResolvedValue({ _id: '1', email: 'test@example.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User', email: 'test@example.com', password: 'pass' });

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe('Email already registered');
    });

    it('creates user and requires MFA enrollment', async () => {
      User.findOne.mockResolvedValue(null);
      User.hashPassword = jest.fn().mockResolvedValue('hashed');
      User.create.mockResolvedValue({
        _id: 'user-id',
        mfaEnrollmentRequired: true,
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User', email: 'test@example.com', password: 'pass' });

      expect(User.hashPassword).toHaveBeenCalledWith('pass');
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'User',
          email: 'test@example.com',
          passwordHash: 'hashed',
          mfaEnrollmentRequired: true,
        })
      );
      expect(res.statusCode).toBe(201);
      expect(res.body.mfaEnrollmentRequired).toBe(true);
      expect(res.body.userId).toBe('user-id');
    });
  });

  /* -------------------- LOGIN -------------------- 

  describe('POST /api/auth/login', () => {
    it('400 if missing email or password', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'x' });
      expect(res.statusCode).toBe(400);
    });

    it('401 if user not found', async () => {
      User.findOne.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'pass' });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    });

    it('403 if MFA enrollment required', async () => {
      User.findOne.mockResolvedValue({
        _id: 'user-id',
        passwordHash: 'hash',
        mfaEnrollmentRequired: true,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'pass' });

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('MFA enrollment required');
      expect(res.body.redirectTo).toBe('/enroll-mfa');
      expect(res.body.userId).toBe('user-id');
    });

    it('401 if password invalid', async () => {
      const user = {
        _id: 'user-id',
        email: 'test@example.com',
        role: 'user',
        mfaEnrollmentRequired: false,
        mfaEnabled: false,
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });

      expect(user.comparePassword).toHaveBeenCalledWith('wrong');
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    });

    it('requires MFA if enabled', async () => {
      const user = {
        _id: 'user-id',
        email: 'test@example.com',
        role: 'user',
        mfaEnrollmentRequired: false,
        mfaEnabled: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(user);

      signAccessToken.mockReturnValue('temp.jwt');

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'pass' });

      expect(res.statusCode).toBe(200);
      expect(res.body.mfaRequired).toBe(true);
      expect(res.body.tempToken).toBe('temp.jwt');
      expect(res.body.userId).toBe('user-id');
    });

    it('normal login flow when no MFA', async () => {
      const user = {
        _id: 'user-id',
        email: 'test@example.com',
        role: 'user',
        mfaEnrollmentRequired: false,
        mfaEnabled: false,
        refreshTokens: [],
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(),
      };
      User.findOne.mockResolvedValue(user);

      bcrypt.hash.mockResolvedValue('refresh-hash');
      signAccessToken.mockReturnValue('access.jwt');
      signRefreshToken.mockReturnValue('refresh.jwt');

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'pass' });

      expect(res.statusCode).toBe(200);
      expect(res.body.accessToken).toBe('access.jwt');
      expect(res.body.user.email).toBe('test@example.com');
      expect(user.refreshTokens[0].tokenHash).toBe('refresh-hash');
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  /* -------------------- MFA SETUP -------------------- 

  describe('GET /api/auth/mfa/setup/:userId', () => {
    it('404 if user not found', async () => {
      User.findById.mockResolvedValue(null);
      const res = await request(app).get('/api/auth/mfa/setup/user-id');
      expect(res.statusCode).toBe(404);
    });

    it('reuses existing secret and returns QR code', async () => {
      const user = {
        _id: 'user-id',
        email: 'test@example.com',
        mfaSecret: 'BASE32SECRET',
        save: jest.fn(),
      };
      User.findById.mockResolvedValue(user);

      const otpauthUrl = 'otpauth://totp/...';
      speakeasy.otpauthURL.mockReturnValue(otpauthUrl);
      qrcode.toDataURL.mockResolvedValue('data:image/png;base64,...');

      const res = await request(app).get('/api/auth/mfa/setup/user-id');

      expect(res.statusCode).toBe(200);
      expect(res.body.qrCode).toBe('data:image/png;base64,...');
      expect(user.save).not.toHaveBeenCalled();
    });
  });

  /* -------------------- VERIFY MFA SETUP -------------------- 

  describe('POST /api/auth/mfa/verify-setup', () => {
    it('400 if user not found', async () => {
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/mfa/verify-setup')
        .send({ userId: 'user-id', code: '123456' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('400 if MFA not set up for user', async () => {
      User.findById.mockResolvedValue({
        _id: 'user-id',
        mfaSecret: null,
      });

      const res = await request(app)
        .post('/api/auth/mfa/verify-setup')
        .send({ userId: 'user-id', code: '123456' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('MFA is not set up for this user');
    });

    it('400 if code format invalid', async () => {
      User.findById.mockResolvedValue({
        _id: 'user-id',
        mfaSecret: 'BASE32',
      });

      const res = await request(app)
        .post('/api/auth/mfa/verify-setup')
        .send({ userId: 'user-id', code: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid MFA code format');
    });

    it('400 if TOTP invalid', async () => {
      User.findById.mockResolvedValue({
        _id: 'user-id',
        mfaSecret: 'BASE32',
      });
      speakeasy.totp.verify.mockReturnValue(false);

      const res = await request(app)
        .post('/api/auth/mfa/verify-setup')
        .send({ userId: 'user-id', code: '123456' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid MFA code');
    });

    it('enables MFA and issues tokens on success', async () => {
      const user = {
        _id: 'user-id',
        email: 'test@example.com',
        role: 'user',
        mfaSecret: 'BASE32',
        refreshTokens: [],
        save: jest.fn().mockResolvedValue(),
      };
      User.findById.mockResolvedValue(user);

      speakeasy.totp.verify.mockReturnValue(true);
      signAccessToken.mockReturnValue('access.jwt');
      signRefreshToken.mockReturnValue('refresh.jwt');
      bcrypt.hash.mockResolvedValue('refresh-hash');

      const res = await request(app)
        .post('/api/auth/mfa/verify-setup')
        .send({ userId: 'user-id', code: '123456' });

      expect(user.mfaEnabled).toBe(true);
      expect(user.mfaEnrollmentRequired).toBe(false);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBe('access.jwt');
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  /* -------------------- VERIFY MFA LOGIN -------------------- 

  describe('POST /api/auth/mfa/verify-login', () => {
    it('404 if user not found', async () => {
      verifyAccess.mockReturnValue({ sub: 'user-id' });
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/mfa/verify-login')
        .send({ tempToken: 'temp', code: '123456' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('400 if MFA is not set up for user', async () => {
      verifyAccess.mockReturnValue({ sub: 'user-id' });
      User.findById.mockResolvedValue({
        _id: 'user-id',
        mfaSecret: null,
      });

      const res = await request(app)
        .post('/api/auth/mfa/verify-login')
        .send({ tempToken: 'temp', code: '123456' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('MFA is not set up for this user');
    });

    it('400 if code format invalid', async () => {
      verifyAccess.mockReturnValue({ sub: 'user-id' });
      User.findById.mockResolvedValue({
        _id: 'user-id',
        mfaSecret: 'BASE32',
      });

      const res = await request(app)
        .post('/api/auth/mfa/verify-login')
        .send({ tempToken: 'temp', code: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid MFA code format');
    });

    it('400 if TOTP invalid', async () => {
      verifyAccess.mockReturnValue({ sub: 'user-id' });
      User.findById.mockResolvedValue({
        _id: 'user-id',
        mfaSecret: 'BASE32',
      });
      speakeasy.totp.verify.mockReturnValue(false);

      const res = await request(app)
        .post('/api/auth/mfa/verify-login')
        .send({ tempToken: 'temp', code: '123456' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid MFA code');
    });

    it('issues full tokens on success', async () => {
      const user = {
        _id: 'user-id',
        email: 'test@example.com',
        role: 'user',
        mfaSecret: 'BASE32',
        refreshTokens: [],
        save: jest.fn().mockResolvedValue(),
      };
      verifyAccess.mockReturnValue({ sub: 'user-id' });
      User.findById.mockResolvedValue(user);
      speakeasy.totp.verify.mockReturnValue(true);
      signAccessToken.mockReturnValue('access.jwt');
      signRefreshToken.mockReturnValue('refresh.jwt');
      bcrypt.hash.mockResolvedValue('refresh-hash');

      const res = await request(app)
        .post('/api/auth/mfa/verify-login')
        .send({ tempToken: 'temp', code: '123456' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBe('access.jwt');
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  /* -------------------- MFA RESET -------------------- 

  describe('POST /api/auth/mfa/reset', () => {
    it('400 if missing tempToken', async () => {
      const res = await request(app).post('/api/auth/mfa/reset').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing MFA session token');
    });

    it('403 if mfaStage not pending', async () => {
      verifyAccess.mockReturnValue({ sub: 'user-id', mfaStage: 'none' });

      const res = await request(app)
        .post('/api/auth/mfa/reset')
        .send({ tempToken: 'temp' });

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('Invalid MFA reset context');
    });

    it('resets MFA flags and returns redirect', async () => {
      const user = {
        _id: 'user-id',
        mfaEnabled: true,
        mfaEnrollmentRequired: false,
        mfaSecret: 'BASE32',
        save: jest.fn().mockResolvedValue(),
      };
      verifyAccess.mockReturnValue({ sub: 'user-id', mfaStage: 'pending' });
      User.findById.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/auth/mfa/reset')
        .send({ tempToken: 'temp' });

      expect(user.mfaEnabled).toBe(false);
      expect(user.mfaEnrollmentRequired).toBe(true);
      expect(user.mfaSecret).toBeNull();
      expect(res.statusCode).toBe(200);
      expect(res.body.redirectTo).toBe('/enroll-mfa');
    });
  });

  /* -------------------- REFRESH -------------------- 

  describe('POST /api/auth/refresh', () => {
    it('401 if missing refresh token cookie', async () => {
      const res = await request(app).post('/api/auth/refresh');
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Missing refresh token');
    });

    it('401 if user not found', async () => {
      verifyRefresh.mockReturnValue({ sub: 'user-id' });
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=token']);

      expect(res.statusCode).toBe(401);
    });

    it('401 if refresh token not in user store', async () => {
      verifyRefresh.mockReturnValue({ sub: 'user-id' });
      const user = {
        _id: 'user-id',
        refreshTokens: [{ tokenHash: 'hash1' }],
        save: jest.fn().mockResolvedValue(),
      };
      User.findById.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false); // no match

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=token']);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Refresh token invalid');
      expect(user.refreshTokens).toEqual([]);
    });

    it('returns new access token on success', async () => {
      verifyRefresh.mockReturnValue({ sub: 'user-id' });

      const user = {
        _id: 'user-id',
        email: 'test@example.com',
        role: 'user',
        refreshTokens: [{ tokenHash: 'hash1' }],
        save: jest.fn().mockResolvedValue(),
      };
      User.findById.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true); // found index 0

      signAccessToken.mockReturnValue('new-access.jwt');
      signRefreshToken.mockReturnValue('new-refresh.jwt');
      bcrypt.hash.mockResolvedValue('new-hash');

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=oldtoken']);

      expect(res.statusCode).toBe(200);
      expect(res.body.accessToken).toBe('new-access.jwt');
      expect(res.headers['set-cookie']).toBeDefined();
      expect(
        user.refreshTokens[user.refreshTokens.length - 1].tokenHash
      ).toBe('new-hash');
    });
  });

  /* -------------------- LOGOUT -------------------- 

  describe('POST /api/auth/logout', () => {
    it('ok if no refresh token cookie', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('removes refresh token when found', async () => {
      verifyRefresh.mockReturnValue({ sub: 'user-id' });
      const user = {
        _id: 'user-id',
        refreshTokens: [{ tokenHash: 'hash1' }],
        save: jest.fn().mockResolvedValue(),
      };
      User.findById.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true); // match

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', ['refreshToken=token']);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(user.refreshTokens).toEqual([]);
    });
  });

    /* -------------------- ME -------------------- 

  describe('GET /api/auth/me', () => {
    it('returns current user when token valid', async () => {
      // auth middleware uses verifyAccess under the hood
      verifyAccess.mockReturnValue({ sub: 'user-id', email: 't', role: 'user' });
      User.findById.mockResolvedValue({
        _id: 'user-id',
        email: 'test@example.com',
        name: 'User',
        role: 'user',
        select() {
          return this; // mimic Mongoose chainable select
        },
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid.token');

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toEqual({
        _id: 'user-id',
        email: 'test@example.com',
        name: 'User',
        role: 'user',
      });
    });

    it('401 when token missing', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Missing token');
    });

    it('401 when token invalid', async () => {
      verifyAccess.mockImplementation(() => {
        throw new Error('bad token');
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token');

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid or expired token');
    });
  });
});

*/