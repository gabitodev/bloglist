const express = require('express');
const app = express();
const cors = require('cors');
const logger = require('./utils/logger');
const { MONGODB_URI } = require('./utils/config');
require('express-async-errors');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const mongoose = require('mongoose');

const connectionDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Error conecting to MongoDB', error.message);
  }
};

connectionDB();

app.use(cors());
app.use(express.json());

app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);

module.exports = app;