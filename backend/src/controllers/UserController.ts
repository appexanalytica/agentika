import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
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
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export class UserController {
  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { role, search, isActive } = req.query;
      const filter: any = {};

      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
        ];
      }

      const users = await User.find(filter).sort({ createdAt: -1 }).select('-passwordHash');
      res.json({ success: true, data: { users: users.map(sanitizeUser) } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.params.id).select('-passwordHash');
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.json({ success: true, data: { user: sanitizeUser(user) } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: errors.array()[0].msg });
      return;
    }

    try {
      const { username, email, password, firstName, lastName, role } = req.body;

      const existing = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
      });
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
        role: role || 'user',
      });

      res.status(201).json({ success: true, data: { user: sanitizeUser(user) } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: errors.array()[0].msg });
      return;
    }

    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      delete updateData.passwordHash;

      // Only super_admin can change roles
      if (updateData.role && req.user!.role !== 'super_admin') {
        res.status(403).json({ success: false, message: 'Only super admin can change roles' });
        return;
      }

      // Prevent self-demotion if you're the last super_admin
      const targetUser = await User.findById(id);
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (updateData.role && targetUser.role === 'super_admin' && updateData.role !== 'super_admin') {
        const superAdminCount = await User.countDocuments({ role: 'super_admin', isActive: true });
        if (superAdminCount <= 1) {
          res.status(403).json({ success: false, message: 'Cannot demote the last active super admin' });
          return;
        }
      }

      const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash');
      res.json({ success: true, data: { user: sanitizeUser(user) } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const targetUser = await User.findById(id);

      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (targetUser.role === 'super_admin') {
        const superAdminCount = await User.countDocuments({ role: 'super_admin', isActive: true });
        if (superAdminCount <= 1) {
          res.status(403).json({ success: false, message: 'Cannot delete the last active super admin' });
          return;
        }
      }

      await User.findByIdAndDelete(id);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async toggleActive(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const targetUser = await User.findById(id);

      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (targetUser.role === 'super_admin' && targetUser.isActive) {
        const superAdminCount = await User.countDocuments({ role: 'super_admin', isActive: true });
        if (superAdminCount <= 1) {
          res.status(403).json({ success: false, message: 'Cannot deactivate the last active super admin' });
          return;
        }
      }

      targetUser.isActive = !targetUser.isActive;
      await targetUser.save();

      res.json({ success: true, data: { user: sanitizeUser(targetUser) } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updatePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { password } = req.body;

      if (!password || password.length < 8) {
        res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        return;
      }

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      user.passwordHash = password;
      await user.save();

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new UserController();
