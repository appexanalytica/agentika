import { Response } from 'express';
import User from '../models/User.js';
import { hashPassword, validatePasswordStrength } from '../utils/password.js';
import { sanitizeUser, getPaginationParams, buildFilterQuery } from '../utils/helpers.js';
import type { AuthenticatedRequest, PaginatedResponse, SuccessResponse, ErrorResponse } from '../types/index.js';

export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const filter = buildFilterQuery(req.query, User.schema);

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users.map(u => sanitizeUser(u)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    } as PaginatedResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
    } as ErrorResponse);
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
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

export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName, role, phone, jobTitle, department } = req.body;

    // Only super_admin can create admins
    if (role === 'admin' || role === 'super_admin') {
      if (req.user!.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create admin users',
        } as ErrorResponse);
        return;
      }
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Username or email already exists',
      } as ErrorResponse);
      return;
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors.map(e => ({ message: e })),
      } as ErrorResponse);
      return;
    }

    const user = await User.create({
      username,
      email,
      passwordHash: await hashPassword(password),
      firstName,
      lastName,
      role: role || 'user',
      phone,
      jobTitle,
      department,
    });

    res.status(201).json({
      success: true,
      data: sanitizeUser(user),
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
    } as ErrorResponse);
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone, jobTitle, department, role } = req.body;

    // Only super_admin can change roles
    if (role && req.user!.role !== 'super_admin') {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to change role',
      } as ErrorResponse);
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as ErrorResponse);
      return;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (department !== undefined) user.department = department;
    if (role) user.role = role;

    await user.save();

    res.json({
      success: true,
      data: sanitizeUser(user),
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
    } as ErrorResponse);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'super_admin') {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      } as ErrorResponse);
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as ErrorResponse);
      return;
    }

    // Prevent deleting self
    if (user._id.toString() === req.user!._id) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete yourself',
      } as ErrorResponse);
      return;
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully',
    } as SuccessResponse<null>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
    } as ErrorResponse);
  }
};

export const toggleUserActive = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'super_admin') {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      } as ErrorResponse);
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as ErrorResponse);
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      data: sanitizeUser(user),
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error toggling user status',
    } as ErrorResponse);
  }
};

export const resetUserPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'super_admin') {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      } as ErrorResponse);
      return;
    }

    const { newPassword } = req.body;

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors.map(e => ({ message: e })),
      } as ErrorResponse);
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as ErrorResponse);
      return;
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully',
    } as SuccessResponse<null>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
    } as ErrorResponse);
  }
};
