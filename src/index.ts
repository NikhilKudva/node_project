import express, { Request, Response, NextFunction } from 'express';
import { sequelize } from './models/user';
import { Op } from 'sequelize';
import User from './models/user';
import jwt from 'jsonwebtoken';
import { authenticateJWT, authorizeAdmin } from './middleware/authMiddleware';
import dotenv from 'dotenv';
import cron from 'node-cron';
import markUsersInactive from './utils/activitychecker';
import Redis from 'ioredis';
import expressRedisCache from 'express-redis-cache';
import login from './routes/login';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

const redisClient = new Redis();

redisClient.on('error', (err) => console.error('Redis Client Error', err));

const cache = expressRedisCache({ client: redisClient });

// Middleware to parse JSON request bodies
app.use(express.json());

// Sync database
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch((error) => {
    console.error('Unable to sync database:', error);
  });

// Schedule the cron job to run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running cron job to mark inactive users...');
  await markUsersInactive();
});

// Login route
app.post('/login', login);

// CRUD operations (only accessible by admin)
app.get('/user/:id', authenticateJWT, authorizeAdmin, cache.route(), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/user', authenticateJWT, authorizeAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }
    const user = await User.create({ name, email, password });
    cache.del('/user/*', (error) => {
      if (error) console.error('Error clearing cache:', error);
      else console.log('Cache cleared successfully');
    });
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/user/:id', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (user) {
      await user.update(req.body);
      cache.del(`/user/${id}`, (error) => {
        if (error) console.error('Error clearing cache:', error);
        else console.log('Cache cleared successfully');
      });
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.delete('/user/:id', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (user) {
      await user.destroy();
      cache.del(`/user/${id}`, (error) => {
        if (error) console.error('Error clearing cache:', error);
        else console.log('Cache cleared successfully');
      });
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});