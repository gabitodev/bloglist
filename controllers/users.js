const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body;
  const userExist = await User.findOne({ username });
  
  if (userExist) {
    return response.status(400).json({error: 'username must be unique'})
  } else if (!(username && password)) {
    return response.status(400).json({error: 'username and password is required'});
  } else if (username.length < 3 || password.length < 3) {
    return response.status(400).json({error: 'username and password must be 3 characters long'});
  };

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash
  });

  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {url: 1, title: 1, author: 1});
  response.status(200).json(users);
});

module.exports = usersRouter;