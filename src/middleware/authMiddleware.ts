import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

interface JWTPayload {
  id: number;
  role: 'user' | 'admin';
}

// Middleware to authenticate JWT token
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('Authenticating JWT...');
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }
  console.log('Token:', token);
  console.log('Secret key:', SECRET_KEY);
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JWTPayload;
    
    // Fetch the user from database using the id from JWT
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      console.log('User not found');
      res.status(401).json({ message: 'Unauthorized: User not found' });
      return;
    }

    // Assign the sequelize user instance to req.user
    req.user = user;
    console.log('JWT authenticated:', req.user.id);
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

// Middleware to authorize admin users
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
  console.log('Authorizing admin...');
  if (req.user?.role === 'admin') {
    console.log('Admin authorized');
    next();
  } else {
    console.warn('Admin authorization failed');
    res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};