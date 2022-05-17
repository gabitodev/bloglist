const express = require('express');
const app = express();
const cors = require('cors');
const logger = require('./utils/logger');
const { MONGODB_URI } = require('./utils/config');
const blogRouter = require('./controllers/blog');
const mongoose = require('mongoose');

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch(error => {
    logger.error('Error conecting to MongoDB', error.message);
  });

app.use(cors());
app.use(express.json());

app.use('/api/blogs', blogRouter);

module.exports = app;