import express, { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import { authenticateJWT, authorizeAdmin } from '../middleware/authMiddleware';
import dotenv from 'dotenv';
import cron from 'node-cron';
import Redis from 'ioredis';
import expressRedisCache from 'express-redis-cache';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

const redisClient = new Redis();

redisClient.on('error', (err) => console.error('Redis Client Error', err));

const cache = expressRedisCache({ client: redisClient });

// Middleware to parse JSON request bodies
app.use(express.json());

async function login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ where: { email } });
      if (user && password === user.password) {
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  export default login;