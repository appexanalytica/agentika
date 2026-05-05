import User, { IUser } from '../models/User';
import { generateToken } from '../config/jwt';

export interface RegisterInput {
  username: string;
  email?: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: Partial<IUser>; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ username: input.username });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create new user
      const user = await User.create({
        username: input.username,
        email: input.email,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
      });

      // Generate token
      const token = generateToken({
        id: user._id.toString(),
        username: user.username,
        role: user.role,
      });

      return {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async login(input: LoginInput): Promise<{ user: Partial<IUser>; token: string }> {
    try {
      // Find user by username
      const user = await User.findOne({ username: input.username }).select('+password');

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(input.password);

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('User account is inactive');
      }

      // Generate token
      const token = generateToken({
        id: user._id.toString(),
        username: user.username,
        role: user.role,
      });

      return {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async adminLogin(input: LoginInput): Promise<{ user: Partial<IUser>; token: string }> {
    try {
      // Find user by username
      const user = await User.findOne({ username: input.username }).select('+password');

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user is admin or superadmin
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        throw new Error('Access denied - admin only');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(input.password);

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('User account is inactive');
      }

      // Generate token
      const token = generateToken({
        id: user._id.toString(),
        username: user.username,
        role: user.role,
      });

      return {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      };
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<Partial<IUser> | null> {
    const user = await User.findById(userId);

    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
    };
  }

  async updateUser(
    userId: string,
    updateData: Partial<IUser>
  ): Promise<Partial<IUser> | null> {
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
    };
  }
}

export default new AuthService();
