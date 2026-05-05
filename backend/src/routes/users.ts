import { Router } from 'express';
import User from '../models/User';
import bcryptjs from 'bcryptjs';
import { authMiddleware, requireAdminOrSuperAdmin, requireSuperAdmin } from '../middleware/auth';
import { body } from 'express-validator';
import { validationErrorHandler } from '../middleware/errorHandler';

const router = Router();

// Validation rules
const createUserValidation = () => [
  body('username').notEmpty().trim().toLowerCase(),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('role').optional().isIn(['superadmin', 'admin', 'user']),
];

const updateUserValidation = () => [
  body('username').optional().notEmpty().trim().toLowerCase(),
  body('email').optional().isEmail().normalizeEmail(),
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('role').optional().isIn(['superadmin', 'admin', 'user']),
];

const updatePasswordValidation = () => [
  body('password').isLength({ min: 6 }),
];

// All routes require authentication and admin/superadmin role
router.use(authMiddleware, requireAdminOrSuperAdmin);

// GET /api/users - List all users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create new user
router.post(
  '/',
  createUserValidation(),
  validationErrorHandler,
  async (req, res, next) => {
    try {
      const { username, email, password, firstName, lastName, role } = req.body;

      // Check if requester is superadmin
      if (req.user?.role !== 'superadmin' && role === 'superadmin') {
        return res.status(403).json({ error: 'Only superadmin can create superadmin users' });
      }

      // Check if requester is admin trying to create admin
      if (req.user?.role === 'admin' && (role === 'admin' || role === 'superadmin')) {
        return res.status(403).json({ error: 'Admin cannot create admin or superadmin users' });
      }

      // Check if username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Check if email already exists (if provided)
      if (email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }

      // Hash password
      const hashedPassword = await bcryptjs.hash(password, 12);

      // Create user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'user',
        isActive: true,
        createdBy: req.user?.id,
      });

      // Return user without password
      const userResponse = user.toObject();
      const { password: pwd, ...userWithoutPassword } = userResponse;

      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/:id - Get single user
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/users/:id - Update user
router.patch(
  '/:id',
  updateUserValidation(),
  validationErrorHandler,
  async (req, res, next) => {
    try {
      const { username, email, firstName, lastName, role } = req.body;
      const targetUserId = req.params.id;
      const requesterId = req.user?.id;
      const requesterRole = req.user?.role;

      // Find target user
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent modifying superadmin unless you are superadmin
      if (targetUser.role === 'superadmin' && requesterRole !== 'superadmin') {
        return res.status(403).json({ error: 'Cannot modify superadmin' });
      }

      // Prevent admin from modifying their own role to superadmin
      if (requesterId === targetUserId && role === 'superadmin') {
        return res.status(403).json({ error: 'Cannot promote yourself to superadmin' });
      }

      // Prevent admin from assigning admin role
      if (requesterRole === 'admin' && role === 'admin') {
        return res.status(403).json({ error: 'Admin cannot assign admin role' });
      }

      // Prevent admin from assigning superadmin role
      if (requesterRole === 'admin' && role === 'superadmin') {
        return res.status(403).json({ error: 'Admin cannot assign superadmin role' });
      }

      // Check username uniqueness if changing
      if (username && username !== targetUser.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ error: 'Username already exists' });
        }
      }

      // Check email uniqueness if changing
      if (email && email !== targetUser.email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }

      // Update user
      const updateData: any = {};
      if (username) updateData.username = username;
      if (email !== undefined) updateData.email = email;
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (role) updateData.role = role;

      const updatedUser = await User.findByIdAndUpdate(
        targetUserId,
        updateData,
        { new: true }
      ).select('-password');

      res.json({ user: updatedUser });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/users/:id/password - Change user password
router.patch(
  '/:id/password',
  updatePasswordValidation(),
  validationErrorHandler,
  async (req, res, next) => {
    try {
      const { password } = req.body;
      const targetUserId = req.params.id;
      const requesterId = req.user?.id;
      const requesterRole = req.user?.role;

      // Find target user
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent modifying superadmin unless you are superadmin
      if (targetUser.role === 'superadmin' && requesterRole !== 'superadmin') {
        return res.status(403).json({ error: 'Cannot modify superadmin password' });
      }

      // Hash new password
      const hashedPassword = await bcryptjs.hash(password, 12);

      // Update password
      await User.findByIdAndUpdate(targetUserId, { password: hashedPassword });

      return res.json({ message: 'Password updated successfully' });
    } catch (error) {
      return next(error);
    }
  }
);

// PATCH /api/users/:id/status - Activate/deactivate user
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const targetUserId = req.params.id;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    // Find target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent modifying superadmin unless you are superadmin
    if (targetUser.role === 'superadmin' && requesterRole !== 'superadmin') {
      return res.status(403).json({ error: 'Cannot modify superadmin status' });
    }

    // Prevent deactivating yourself
    if (requesterId === targetUserId && !isActive) {
      return res.status(403).json({ error: 'Cannot deactivate yourself' });
    }

    // Update status
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { isActive },
      { new: true }
    ).select('-password');

    return res.json({ user: updatedUser });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/users/:id - Delete user (only superadmin)
router.delete('/:id', requireSuperAdmin, async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const requesterId = req.user?.id;

    // Prevent deleting yourself
    if (requesterId === targetUserId) {
      return res.status(403).json({ error: 'Cannot delete yourself' });
    }

    // Find target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting another superadmin
    if (targetUser.role === 'superadmin') {
      return res.status(403).json({ error: 'Cannot delete superadmin' });
    }

    // Delete user
    await User.findByIdAndDelete(targetUserId);

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    return next(error);
  }
});

export default router;
