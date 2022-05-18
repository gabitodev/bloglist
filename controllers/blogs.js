const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const { userExtractor } = require('../utils/middleware');

blogsRouter.get('/', async (request, response) =>  {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1});
  response.status(200).json(blogs);
});

blogsRouter.post('/', userExtractor, async (request, response) => {
  const { author, title, likes, url } = request.body;
  if (!(author && title)) {
    return response.status(400).end();
  }

  const user = request.user;
  const blog = new Blog({
    title,
    author,
    likes,
    url,
    user: user._id
  });
  const savedBlog  = await blog.save();

  user.blogs = user.blogs.concat(savedBlog._id);

  await user.save();
  
  response.status(201).json(savedBlog);
  
});

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user;
  const blog = await Blog.findById(request.params.id);
  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } else {
    response.status(401).json({ error: 'wrong user' });
  }
});

blogsRouter.patch('/:id', userExtractor, async (request, response) => {
  const blogToUpdate = request.body;
  const user = request.user;
  const blogUpdated = await Blog.findByIdAndUpdate(request.params.id, {$set: {likes: blogToUpdate.likes}}, { new: true });
  response.status(200).json(blogUpdated);
});

module.exports = blogsRouter;