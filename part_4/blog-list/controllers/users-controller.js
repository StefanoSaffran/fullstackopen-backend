const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {

  const users = await User
    .find({})
      .populate('blogs',
        {
          title: 1,
          author: 1,
          likes: 1
        })

  response.json(users.map(u => u.toJSON()))
})

usersRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body

    const regex = /(?=.*?[0-9])(?=.*?[A-Za-z]).+/

    if (!regex.test(body.password)) {
      return response.status(400).json({
        error: 'Password needs to contain at least one number and one character'
      })
    }

    if(body.password.length < 3) {
      return response.status(400).json({
        error: 'Password needs to be greater than 2 characters'
      })
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    })

    const savedUser = await user.save()

    response.json(savedUser)
  } catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter