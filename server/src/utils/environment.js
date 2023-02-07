'use strict';

require('dotenv').config();

module.exports = {
  appName: 'agri-grow',
  host: process.env.HOST_NAME || 'localhost',
  port: process.env.PORT || 8000,
  db: process.env.MONGODB_NUCLEUS_URI || 'MONGODB_NUCLEUS_URI',

};
