import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  id: string;
  username: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
