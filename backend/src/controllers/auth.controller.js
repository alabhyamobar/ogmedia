import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { loginSchema, changePasswordSchema, resetPasswordSchema } from '../validators/index.js';
import { AUDIT_ACTIONS } from '../constants/index.js';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ogmedia_super_secret_crm_jwt_production_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'ogmedia_super_secret_crm_refresh_key_2026';
const isProduction = process.env.NODE_ENV === 'production';

// Helpers to generate tokens
function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      userId: user._id
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

function setRefreshTokenCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax'),
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

export async function login(req, res, next) {
  try {
    const { login: identifier, password } = loginSchema.parse(req.body);

    const user = await User.findOne({
      $or: [{ username: identifier.toLowerCase() }, { email: identifier.toLowerCase() }]
    }).select('+passwordHash');

    // Generic error to prevent user enumeration
    const genericAuthError = () => {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password.'
        },
        requestId: req.id
      });
    };

    if (!user) {
      await AuditLog.create({
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        targetType: 'AUTH',
        targetId: identifier,
        performedByName: 'UNAUTHENTICATED',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: { reason: 'User not found', identifier }
      }).catch(() => {});

      return genericAuthError();
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const waitMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
      return res.status(423).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: `Account is temporarily locked due to excessive failed attempts. Please retry in ${waitMinutes} minutes.`
        },
        requestId: req.id
      });
    }

    // Check if account is disabled
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Your account has been deactivated. Please contact an administrator.'
        },
        requestId: req.id
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed attempts and lock if >= 5
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
        logger.warn({ msg: 'Account locked due to 5 consecutive failed logins', username: user.username, ip: req.ip });
      }
      await user.save();

      await AuditLog.create({
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        targetType: 'AUTH',
        targetId: user._id.toString(),
        performedByName: user.username,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: { reason: 'Invalid password', failedAttempts: user.failedLoginAttempts }
      }).catch(() => {});

      return genericAuthError();
    }

    // Login successful - reset lockout and failed attempts
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setRefreshTokenCookie(res, refreshToken);

    await AuditLog.create({
      action: AUDIT_ACTIONS.LOGIN,
      targetType: 'AUTH',
      targetId: user._id.toString(),
      performedBy: user._id,
      performedByName: user.username,
      role: user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { role: user.role }
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          expertise: user.expertise,
          status: user.status,
          mustChangePassword: user.mustChangePassword,
          lastLoginAt: user.lastLoginAt
        }
      },
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.user) {
      await AuditLog.create({
        action: AUDIT_ACTIONS.LOGOUT,
        targetType: 'AUTH',
        targetId: req.user._id.toString(),
        performedBy: req.user._id,
        performedByName: req.user.username,
        role: req.user.role,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }).catch(() => {});
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax')
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: 'Refresh token required.'
        },
        requestId: req.id
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User no longer active or valid.'
        },
        requestId: req.id
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken
      },
      requestId: req.id
    });
  } catch {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token.'
      },
      requestId: req.id
    });
  }
}

export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        expertise: req.user.expertise,
        status: req.user.status,
        mustChangePassword: req.user.mustChangePassword,
        lastLoginAt: req.user.lastLoginAt
      }
    },
    requestId: req.id
  });
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password does not match.'
        },
        requestId: req.id
      });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.mustChangePassword = false;
    await user.save();

    await AuditLog.create({
      action: AUDIT_ACTIONS.PASSWORD_RESET,
      targetType: 'USER',
      targetId: user._id.toString(),
      performedBy: user._id,
      performedByName: user.username,
      role: user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { selfService: true }
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}
