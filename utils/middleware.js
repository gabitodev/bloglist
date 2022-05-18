const User = require('../models/user');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7);
    return next();
  }
  request.token = null;
  next();
};

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(decodedToken.id);
  request.user = user;
  next();
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    });
  }
  next(error);
}

module.exports = { tokenExtractor, userExtractor, errorHandler };