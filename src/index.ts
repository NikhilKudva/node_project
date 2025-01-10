import express, { Request, Response, NextFunction } from 'express';
import { sequelize } from './models/user';
import { Op } from 'sequelize';
import User from './models/user';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticateJWT, authorizeAdmin } from './middleware/authMiddleware';
import dotenv from 'dotenv';
import cron from 'node-cron';
import markUsersInactive from './utils/activitychecker';

dotenv.config();

const app = express();
const port = 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

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
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// CRUD operations (only accessible by admin)
app.get('/user/:id', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
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

app.post('/user', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = await User.create({ name, email, password: hashedPassword });
    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/user/:id', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (user) {
      await user.update(req.body);
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