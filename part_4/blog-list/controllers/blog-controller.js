const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = req => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

module.exports = {
  async store(req, res) {
    const blog = new Blog(req.body)

    const token = getTokenFrom(req)

    try {
      const decodedToken = jwt.verify(token, process.env.SECRET)

      if (!token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
      }

      const user = await User.findById(decodedToken.id)
      if (!blog.hasOwnProperty('likes')) {
        blog.likes = 0;
      }

      blog.user = user._id;

      const savedblog = await blog.save()

      user.blogs = user.blogs.concat(savedblog._id)

      await user.save()

      res.status(201).json(savedblog.toJSON())

    } catch (exception) {
      next(exception)
    }
  },

  async index(req, res) {
    const blogs = await Blog
      .find({})
      .populate('user',
        {
          username: 1,
          name: 1
        })

  res.json(blogs.map(blog => blog.toJSON()))
  },

  async show(req, res) {
    const { id } = req.params;

    const blog = await Blog
      .findById(id)
      .populate('user',
        {
          username: 1,
          name: 1
        })

    res.json(blog.toJSON())
  },

  async update(req, res, next) {
    const body = req.body;
    const { id } = req.params;

    try {
      const updatedBlog = await Blog.findByIdAndUpdate(id, body, { new: true });

      res.json(updatedBlog.toJSON());
    } catch(err) {
      next(err);
    }
  },

  async delete(req, res) {
    const { id } = req.params;

    const blog = await Blog.findById(id)

    const token = getTokenFrom(req)

    try {
      const decodedToken = jwt.verify(token, process.env.SECRET)

      if (!token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
      }

      if (blog.user.toString() === decodedToken.id.toString()) {
        await Blog.findByIdAndRemove(id)
        res.status(204).end()
      } else {
        res.status(401).end()
      }

    } catch (exception) {
      next(exception)
    }
  }
}