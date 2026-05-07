import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const sanitizeUser = (user: any) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName} ${user.lastName}`,
  role: user.role,
  avatar: user.avatar,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: errors.array()[0].msg });
      return;
    }

    try {
      const { username, email, password, firstName, lastName } = req.body;

      const existing = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] });
      if (existing) {
        res.status(409).json({ success: false, message: 'Username or email already exists' });
        return;
      }

      const user = await User.create({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash: password,
        firstName,
        lastName,
        role: 'user',
      });

      const token = generateAccessToken({
        sub: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({ sub: user._id.toString() });

      res.status(201).json({
        success: true,
        data: { user: sanitizeUser(user), token, refreshToken },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Registration failed' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: errors.array()[0].msg });
      return;
    }

    try {
      const { usernameOrEmail, password } = req.body;

      const user = await User.findOne({
        $or: [
          { username: usernameOrEmail.toLowerCase() },
          { email: usernameOrEmail.toLowerCase() },
        ],
      }).select('+passwordHash');

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }

      const valid = await user.comparePassword(password);
      if (!valid) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({ success: false, message: 'Account is deactivated. Contact an administrator.' });
        return;
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateAccessToken({
        sub: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({ sub: user._id.toString() });

      res.json({
        success: true,
        data: { user: sanitizeUser(user), token, refreshToken },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Login failed' });
    }
  }

  async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { usernameOrEmail, password } = req.body;

      const user = await User.findOne({
        $or: [
          { username: usernameOrEmail.toLowerCase() },
          { email: usernameOrEmail.toLowerCase() },
        ],
      }).select('+passwordHash');

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }

      if (user.role !== 'super_admin' && user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Admin access required' });
        return;
      }

      const valid = await user.comparePassword(password);
      if (!valid) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({ success: false, message: 'Account is deactivated' });
        return;
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateAccessToken({
        sub: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({ sub: user._id.toString() });

      res.json({
        success: true,
        data: { user: sanitizeUser(user), token, refreshToken },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Login failed' });
    }
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.user!._id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.json({ success: true, data: { user: sanitizeUser(user) } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, message: 'Refresh token required' });
        return;
      }

      const { verifyToken } = await import('../utils/jwt.js');
      const decoded = verifyToken(refreshToken);
      const user = await User.findById(decoded.sub);

      if (!user || !user.isActive) {
        res.status(401).json({ success: false, message: 'Invalid refresh token' });
        return;
      }

      const token = generateAccessToken({
        sub: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      });

      const newRefreshToken = generateRefreshToken({ sub: user._id.toString() });

      res.json({ success: true, data: { token, refreshToken: newRefreshToken } });
    } catch {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword || newPassword.length < 8) {
        res.status(400).json({ success: false, message: 'Current password and new password (min 8 chars) required' });
        return;
      }

      const user = await User.findById(req.user!._id).select('+passwordHash');
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const valid = await user.comparePassword(currentPassword);
      if (!valid) {
        res.status(401).json({ success: false, message: 'Current password is incorrect' });
        return;
      }

      user.passwordHash = newPassword;
      await user.save();

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new AuthController();
