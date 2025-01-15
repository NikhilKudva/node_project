import express, { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieparser from 'cookie-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || `default_refresh_token_secret`;
app.use(cookieparser());

// Middleware to parse JSON request bodies
app.use(express.json());

async function login(req: Request, res: Response) {
    const { email, password} = req.body;
    try {
      const user = await User.findOne({ where: { email } });
      if (user && password === user.password) {
        const role = user.role;
        if(role === "admin"){
        const accesstoken = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user.id, role: user.role }, REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
        res.cookie('jwt', refreshToken, {
          httpOnly: true,
          sameSite: 'none', secure: true,
          maxAge: 24 * 60 * 60 * 1000});

          res.json({ accessToken: accesstoken });
        }else{
        res.status(401).json({ message: 'Unauthorized: Admin access required' });
        
        }
      }else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  export default login;