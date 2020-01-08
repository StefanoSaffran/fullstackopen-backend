const bcrypt = require('bcrypt')
const User = require('../models/user')

module.exports = {
  async store(req, res, next) {
    try {
      const { name, username, password } = req.body
  
      const regex = /(?=.*?[0-9])(?=.*?[A-Za-z]).+/
  
      if (!regex.test(password)) {
        return res.status(400).json({
          error: 'Password needs to contain at least one number and one character'
        })
      }
  
      if(password.length < 3) {
        return res.status(400).json({
          error: 'Password needs to be greater than 2 characters'
        })
      }
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(password, saltRounds)
  
      const user = new User({
        username: username,
        name: name,
        passwordHash,
      })
  
      const savedUser = await user.save()
  
      return res.json(savedUser)
    } catch (exception) {
      next(exception)
    }
  },

  async index(req, res) {
    const users = await User
      .find({})
        .populate('blogs',
          {
            title: 1,
            author: 1,
            likes: 1
          })

    return res.json(users.map(u => u.toJSON()))
  },

  async show(req, res) {
    const { id } = req.params;

    const user = await User
      .findById(id)
      .populate('blogs',
          {
            title: 1,
            author: 1,
            likes: 1
          })

    res.json(user.toJSON())
  },
}