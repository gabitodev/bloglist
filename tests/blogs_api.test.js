const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});
  for (let blog of initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }
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

describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      _id: '5a422b3a1b54a676234d17f9',
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      __v: 0
    };
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    
    const response = await api.get('/api/blogs');
  
    const blogs = response.body.map(r => {
      return {
        id: r.id,
        title: r.title,
        author: r.author,
        url: r.url,
        likes: r.likes
      }
    });
  
    expect(response.body).toHaveLength(initialBlogs.length + 1);
  
    expect(blogs).toContainEqual(
      {
        id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12,
      }
    );
  }, 100000);

  test('succeeds if the likes property is missing by making it default to 0', async () => {
    const newBlog = {
      _id: '5a422b3a1b54a676234d17f9',
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      __v: 0
    };
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    
    const blogsAtEnd = (await api.get('/api/blogs')).body;
  
    const blogsDetailed = blogsAtEnd.map(r => {
      return {
        id: r.id,
        title: r.title,
        author: r.author,
        url: r.url,
        likes: r.likes
      }
    });
  
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);
  
    expect(blogsDetailed).toContainEqual(
      {
        id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 0,
      }
    );
  }, 100000);

  test('fails with status code 400 if the title and url properties are missing', async () => {
    const newBlog = {
      _id: '5a422b3a1b54a676234d17f9',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      __v: 0
    };
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400);
  
      const blogsAtEnd = await api.get('/api/blogs');
  
      expect(blogsAtEnd.body).toHaveLength(initialBlogs.length);
  }, 100000);
});

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid ', async () => {
    const blogsAtStart = (await api.get('/api/blogs')).body;
    const blogToDelete = blogsAtStart[0];
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204);
  
      const blogsAtEnd = (await api.get('/api/blogs')).body;
      const titles = blogsAtEnd.map(blog => blog.title);
  
      expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1);
      expect(titles).not.toContain(blogToDelete.title);
  }, 100000);
});

describe('updation of a blog', () => {
  test('succeed with status code 200 updating only the parameter like ', async () => {
    const blogsAtStart = (await api.get('/api/blogs')).body;
    const blogToUpdate = blogsAtStart[0];
    blogToUpdate.likes = 500;
  
    await api
      .patch(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200);
  
      const blogsAtEnd = (await api.get('/api/blogs')).body;
      const blogUpdated = blogsAtEnd.find(blog => blog.likes === 500);
  
      expect(blogsAtEnd).toHaveLength(initialBlogs.length);
      expect(blogUpdated.likes).toBe(blogToUpdate.likes);
  }, 100000);
});

afterAll(() => {
  mongoose.connection.close();
});