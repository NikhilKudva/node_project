import express from 'express';
import { sequelize } from './models/user.js';
import User from './models/user.js';
const app = express();
const port = 3000;

app.use(express.json());

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch((error) => {
    console.error('Unable to sync database:', error);
  });

// Routes
// GET: Fetch a user by ID
app.get('/user/:id', async (req, res) => {
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

// POST: Create a new user
app.post('/user', async (req, res) => {
  try {
    const user = await User.create(req.body); 
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PUT: Update an existing user
app.put('/user/:id', async (req, res) => {
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

// DELETE: Delete a user
app.delete('/user/:id', async (req, res) => {
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

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

