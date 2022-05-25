const express = require('express');
require('express-async-errors');
const app = express();
require('dotenv').config();
const cors = require('cors');
const logger = require('./utils/logger');
const { MONGODB_URI } = require('./utils/config');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const mongoose = require('mongoose');
const loginRouter = require('./controllers/login');
const middleware = require('./utils/middleware');

const connectionDB = async () => {
  await mongoose.connect(MONGODB_URI);
  logger.info('Connected to MongoDB');
};

connectionDB();

app.use(cors());
app.use(express.json());
app.use(middleware.tokenExtractor);


app.use('/api/login', loginRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing');
  app.use('/api/testing', testingRouter);
}

app.use(middleware.errorHandler);

module.exports = app;