const path = require('path');
require('dotenv').config();
module.exports = {
  PORT: process.env.PORT || 3001,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin@gmail.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Hola1234',
  DB_PATH: process.env.DB_PATH || path.resolve(__dirname, '../../BD/database.db'),
  SALT_ROUNDS: 10,
};