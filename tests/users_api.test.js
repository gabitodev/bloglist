const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { usersInDB } = require('../utils/list_helper');


beforeEach(async () => {
  await User.deleteMany({});
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('secret', saltRounds);
  const user = new User({username: 'test123', name:'el tester', passwordHash});
  await user.save();
}, 100000);

describe('addition of a user', () => {
  test('susceeds with code 200 if data is valid', async () => {
    const usersAtStart = await usersInDB();
    
    const newUser = {
      username: 'alejandro78',
      name: 'Alejandro Gonzales',
      password: 'secret25'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await usersInDB();

    const usernames = usersAtEnd.map(user => user.username);
    expect(usernames).toContain(newUser.username);
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);
  }, 100000);

  test('fails with code 400 and message if username already is taken ', async () => {
    const usersAtStart = await usersInDB();
    
    const newUser = {
      username: 'test123',
      name: 'Alejandro Gonzales',
      password: 'secret25'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);


    expect(result.body.error).toContain('username must be unique');
    const usersAtEnd = await usersInDB();
    expect(usersAtEnd).toEqual(usersAtStart);
  }, 100000);

  test('fails with code 400 and message if username and password is missing', async () => {
    const usersAtStart = await usersInDB();
    
    const newUser = {
      name: 'Alejandro Gonzales',
      password: '322323'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('username and password is required');
    const usersAtEnd = await usersInDB();
    expect(usersAtEnd).toEqual(usersAtStart);
  }, 100000);

  test('fails with code 400 and message if username and password is less than 3 characters', async () => {
    const usersAtStart = await usersInDB();
    
    const newUser = {
      username: 'p33434',
      name: 'Alejandro Gonzales',
      password: '2'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('username and password must be 3 characters long');
    const usersAtEnd = await usersInDB();
    expect(usersAtEnd).toEqual(usersAtStart);
  }, 100000);
})