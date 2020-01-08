const express = require('express');

const routes = express.Router();

const loginController = require('./controllers/login-controller')
const userController = require('./controllers/users-controller')
const blogController = require('./controllers/blog-controller')

routes.post('/api/login', loginController.store);

routes.post('/api/users', userController.store);
routes.get('/api/users', userController.index);
routes.get('/api/users/:id', userController.show);
// routes.delete('/api/users', userController.delete);

routes.post('/api/blogs', blogController.store);
routes.get('/api/blogs', blogController.index);
routes.get('/api/blogs/:id', blogController.show);
routes.put('/api/blogs/:id', blogController.update);
routes.delete('/api/blogs/:id', blogController.delete);

module.exports = routes;