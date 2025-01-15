import express, { Request, Response, NextFunction } from 'express';
import { sequelize } from './models/user';
import User from './models/user';
import { authenticateJWT, authorizeAdmin } from './middleware/authMiddleware';
import dotenv from 'dotenv';
import cron from 'node-cron';
import markUsersInactive from './utils/activitychecker';
import Redis from 'ioredis';
import expressRedisCache from 'express-redis-cache';
import login from './functions/login';
import refresh from './functions/refresh';
import {getUser,createUser,updateUser,deleteUser} from './functions/crud';

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

//refresh route
app.post('/refresh', refresh);

// CRUD operations (only accessible by admin)
app.get('/user/:id',cache.route(), getUser);

app.post('/user',createUser); 

app.put('/user/:id',updateUser);
 
app.delete('/user/:id',deleteUser)
  

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});