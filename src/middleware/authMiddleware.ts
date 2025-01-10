import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
// Middleware to authenticate JWT token
const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) {
      const secretKey = process.env.SECRET_KEY;
      if (!secretKey) {
        return res.sendStatus(500); // Internal Server Error if secret key is not defined
      }
      jwt.verify(token, secretKey, (err: jwt.VerifyErrors | null, user: any) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.body = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
  };
  
  // Middleware to authorize admin users
  const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.body && req.body.role === 'admin') {
      next();
    } else {
      res.sendStatus(403);
    }
  };
  
  export { authenticateJWT, authorizeAdmin };