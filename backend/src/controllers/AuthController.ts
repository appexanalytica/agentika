import { Request, Response } from 'express';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.js';
import { sanitizeUser } from '../utils/helpers.js';
import type { AuthenticatedRequest, SuccessResponse, ErrorResponse } from '../types/index.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Username or email already exists',
      } as ErrorResponse);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors.map(e => ({ message: e })),
      } as ErrorResponse);
      return;
    }

    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash: await hashPassword(password),
      firstName,
      lastName,
      role: 'user',
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      sub: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({ sub: user._id.toString() });

    res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      },
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
    } as ErrorResponse);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Find user
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    }).select('+passwordHash');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      } as ErrorResponse);
      return;
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      } as ErrorResponse);
      return;
    }

    // Check if active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      } as ErrorResponse);
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken({
      sub: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({ sub: user._id.toString() });

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      },
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
    } as ErrorResponse);
  }
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usernameOrEmail, password } = req.body;

    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      role: { $in: ['admin', 'super_admin'] },
    }).select('+passwordHash');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials or insufficient permissions',
      } as ErrorResponse);
      return;
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      } as ErrorResponse);
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      } as ErrorResponse);
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken({
      sub: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({ sub: user._id.toString() });

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      },
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error during admin login',
    } as ErrorResponse);
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      } as ErrorResponse);
      return;
    }

    const payload = verifyRefreshToken(refreshToken);

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      } as ErrorResponse);
      return;
    }

    const newAccessToken = generateAccessToken({
      sub: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({ sub: user._id.toString() });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    } as ErrorResponse);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as ErrorResponse);
      return;
    }

    res.json({
      success: true,
      data: sanitizeUser(user),
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
    } as ErrorResponse);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user!._id).select('+passwordHash');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as ErrorResponse);
      return;
    }

    const isValidPassword = await comparePassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      } as ErrorResponse);
      return;
    }

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      res.status(400).json({
        success: false,
        message: 'New password does not meet requirements',
        errors: passwordValidation.errors.map(e => ({ message: e })),
      } as ErrorResponse);
      return;
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    } as SuccessResponse<null>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
    } as ErrorResponse);
  }
};
