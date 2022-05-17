const blogRouter = require('express').Router();
const Blog = require('../models/blog');

blogRouter.get('/', async (request, response) =>  {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body);
  if (!blog.author && !blog.title) {
    response.status(400).end();
  } else {
    const result  = await blog.save();
    response.status(201).json(result);
  }
});

blogRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

blogRouter.patch('/:id', async (request, response) => {
  const blogToUpdate = request.body;
  const blogUpdated = await Blog.findByIdAndUpdate(request.params.id, {$set: {likes: blogToUpdate.likes}}, { new: true });
  response.status(200).send(blogUpdated);
});

module.exports = blogRouter;