const jwt = require('jsonwebtoken');

const payload = {
  username: 'nikhiladmin',
  role: 'admin'
};

const secretKey = 'pxmZXXjjNA3dMQH2vKgNmPy+4/Tl8wfiNZhZsY2hHI4=';

const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

console.log(token);