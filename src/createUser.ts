import { sequelize } from './models/user';
import User from './models/user';

const createUser = async () => {
  await sequelize.sync({ alter: true });

  //const hashedPassword = bcrypt.hashSync('nikhiladmin', 8);

  await User.create({
    name: 'Nikhil3',
    email: 'nikhil3@gmail.com',
    password: 'nikhil3',
    role: 'user'
  });

  console.log('User created successfully');
};

createUser();