const Blog = require('../models/blog')
const Comment = require('../models/comment')
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
    const { text } = req.body;
    const { id } = req.params;

    if (!text) {
      return res.status(401).json({ error: 'Comment not found' });
    }

    const comment = new Comment(req.body);
    comment.blog = id;

    await comment.save();

    const blog = await Blog.findById(id);
    blog.comments.push(comment);
    blog.save();

    res.json(comment.toJSON());
  }
}