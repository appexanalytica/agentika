import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';
import { body } from 'express-validator';

export const authValidationRules = () => [
  body('username').notEmpty().trim().toLowerCase(),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
];

export const loginValidationRules = () => [
  body('username').notEmpty().trim().toLowerCase(),
  body('password').notEmpty(),
];

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      const result = await AuthService.register({
        username,
        email,
        password,
        firstName,
        lastName,
      });

      res.status(201).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;

      console.log('🔐 Login attempt for username:', username);

      const result = await AuthService.login({
        username,
        password,
      });

      console.log('✅ Login successful for username:', username);

      res.status(200).json({
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      console.error('❌ Login error:', error instanceof Error ? error.message : error);
      next(error);
    }
  }

  async adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;

      console.log('🔐 Admin login attempt for username:', username);

      const result = await AuthService.adminLogin({
        username,
        password,
      });

      console.log('✅ Admin login successful for username:', username);

      res.status(200).json({
        message: 'Admin login successful',
        data: result,
      });
    } catch (error) {
      console.error('❌ Admin login error:', error instanceof Error ? error.message : error);
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await AuthService.getUserById(req.user.id);

      res.status(200).json({
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await AuthService.getUserById(req.user.id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({
        token: req.headers.authorization?.split(' ')[1],
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { firstName, lastName, avatar } = req.body;

      const user = await AuthService.updateUser(req.user.id, {
        firstName,
        lastName,
        avatar,
      });

      res.status(200).json({
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
