const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');
const { blogsInDB } = require('../utils/list_helper');

let token = '';

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    user: "628423ef39d47bef51283534",
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    user: "628423dc39d47bef51283531",
    __v: 0
  },
];

const initialUsers = [
  {
    _id: "628423dc39d47bef51283531",
    username: "robert123",
    name: "Robert Williams",
    password: "123456",
    blogs: ["5a422aa71b54a676234d17f8"],
  },
  {
    _id: "628423ef39d47bef51283534",
    username: "juneke",
    name: "Junior Gomez",
    password: "test123",
    blogs: ["5a422a851b54a676234d17f7"],
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
  for (let blog of initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }
  for (let user of initialUsers) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(user.password, saltRounds);
    let blogObject = new User({
      _id: user._id,
      username: user.username,
      name: user.name,
      passwordHash: passwordHash,
      blogs: user.blogs
    });
    await blogObject.save();
  }

  const response = await api
    .post('/api/login')
    .send({
      username: initialUsers[0].username,
      password: initialUsers[0].password
    })
    .expect(200);

  token = response.body.token;
}, 100000);

describe('when there is initially some blogs', () => {
  test('all blogs are returned in json format and it is the correct amount', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toHaveLength(initialBlogs.length);
  }, 100000);

  test('all blogs have a parameter called id', async () => {
    const response = await api.get('/api/blogs');
    response.body.forEach(blog => expect(blog.id).toBeDefined());
  }, 100000);
});

describe('addition of a new blog with user token', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
    };
  
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    
    const response = await blogsInDB();
  
    const blogs = response.map(r => {
      return {
        title: r.title,
        author: r.author,
        url: r.url,
        likes: r.likes,
        user: r.user.toString()
      }
    });

    expect(response).toHaveLength(initialBlogs.length + 1);
  
    expect(blogs).toContainEqual(
      {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12,
        user: "628423dc39d47bef51283531"
      }
    );
  }, 100000);

  test('fails with code 401 if no token is provided', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
    };
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/);
    
    const response = await blogsInDB();
  
    expect(response).toHaveLength(initialBlogs.length);
  }, 100000);

  test('succeeds if the likes property is missing by making it default to 0', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    };
  
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    
    const blogsAtEnd = await blogsInDB();
  
    const blogs = blogsAtEnd.map(r => {
      return {
        title: r.title,
        author: r.author,
        url: r.url,
        likes: r.likes,
        user: r.user.toString()
      }
    });
  
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);
  
    expect(blogs).toContainEqual(
      {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 0,
        user: "628423dc39d47bef51283531"
      }
    );
  }, 100000);

  test('fails with status code 400 if the title and author properties are missing', async () => {
    const newBlog = {
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 25
    };
  
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400);
  
      const blogsAtEnd = await blogsInDB();
  
      expect(blogsAtEnd).toHaveLength(initialBlogs.length);
  }, 100000);
});

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await blogsInDB();
    const blogToDelete = blogsAtStart[1];
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204);
  
      const blogsAtEnd = await blogsInDB();
      const titles = blogsAtEnd.map(blog => blog.title);
  
      expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1);
      expect(titles).not.toContain(blogToDelete.title);
  }, 100000);
});

describe('updation of a blog', () => {
  test('succeed with status code 200 updating only the parameter like ', async () => {
    const blogsAtStart = await blogsInDB();
    const blogToUpdate = blogsAtStart[1];
    blogToUpdate.likes = 500;
  
    await api
      .patch(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `bearer ${token}`)
      .send(blogToUpdate)
      .expect(200);
  
      const blogsAtEnd = await blogsInDB();
      const blogUpdated = blogsAtEnd.find(blog => blog.likes === 500);
  
      expect(blogsAtEnd).toHaveLength(initialBlogs.length);
      expect(blogUpdated.likes).toBe(blogToUpdate.likes);
  }, 100000);
});

afterAll(() => {
  mongoose.connection.close();
});