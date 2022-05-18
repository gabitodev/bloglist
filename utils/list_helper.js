const { countBy } = require('lodash');
const Blog = require('../models/blog');
const User = require('../models/user');

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const sum = blogs.map(blog => blog.likes).reduce((sum, item) => sum + item, 0);
  return sum;
};

const favoriteBlog = (blogs) => {
  const likes = blogs.map(blog => blog.likes);
  const maxLikes = Math.max(...likes);
  for (const blog of blogs) {
    if (blog.likes === maxLikes) {
      return {
        title: blog.title,
        author: blog.author,
        likes: blog.likes
      }
    };
  };
};

const mostBlogs = (blogs) => {
  const counts = countBy(blogs, 'author');
  const authors = [];
  for (const props in counts ) {
    const author = { author: props, blogs: counts[props]};
    authors.push(author);
  }
  const authorWithMostBlogs = authors.reduce(({sums, most}, {author, blogs}) => {
    sums[author] = blogs = (sums[author] || 0) + blogs;
    if (blogs > most.blogs) most = {author, blogs};
    return {sums,most};
  }, {sums: {}, most: {blogs: 0}}).most;
  return authorWithMostBlogs;
};

const mostLikes = (blogs) => blogs.reduce(({ sums, most }, {likes, author}) => {
  sums[author] = likes = (sums[author] || 0) + likes;
  if (likes > most.likes) most = {author, likes};
  return {sums,most};
}, {sums: {}, most: {likes: 0}}).most;

const blogsInDB = async () => {
  const blogs = await Blog.find({});
  return blogs.map(b => b.toJSON());
}

const usersInDB = async () => {
  const users = await User.find({});
  return users.map(b => b.toJSON());
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes, usersInDB, blogsInDB };