const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
    jest.setTimeout(35000);
    await Blog.deleteMany({})

    let blogObject = helper.initialBlogs
        .map(blog => new Blog(blog))
    const promiseArray = blogObject.map(blog => blog.save())
    await Promise.all(promiseArray)

})

describe('when there is initially some blogs saved', () => {
    test('blogs are returned as json', async () => {
        jest.setTimeout(35000);
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    }, 10000)

    test('all blogs are returned', async () => {
        jest.setTimeout(30000);
        const response = await api.get('/api/blogs')

        expect(response.body.length).toBe(helper.initialBlogs.length)
    }, 10000)

    test.skip('all blogs have the id property', async () => {
        jest.setTimeout(30000);
        const blogs = await helper.blogsInDb()

        const blogsId = blogs.map(b => b._id)
        expect(blogsId).toBeDefined();
    })
    describe('addition of a new note', () => {
        test('a valid blog can be added', async () => {
            const newBlog = {
                title: "Canonical string reduction",
                author: "Edsger W. Dijkstra",
                url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
                likes: 12
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsNow = await helper.blogsInDb()
            expect(blogsNow.length).toBe(helper.initialBlogs.length + 1)

            const title = blogsNow.map(b => b.title)
            expect(title).toContain('Canonical string reduction')

        })

        test('blog without likes property is added with default value 0', async () => {
            jest.setTimeout(30000);
            const newBlog = {
                title: "First class tests",
                author: "Robert C. Martin",
                url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",

            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsNow = await helper.blogsInDb()
            expect(blogsNow[blogsNow.length - 1].likes).toBe(0);

        })

        test('blog without title or url is not added', async () => {
            jest.setTimeout(30000);
            const newBlog = {
                author: "Edsger W. Dijkstra",
                url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
                likes: 12
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400)

            const blogsNow = await helper.blogsInDb()

            expect(blogsNow.length).toBe(helper.initialBlogs.length)

        })
    })
    describe('addition of a new blog', () => {
        test('a blog can be deleted', async () => {
            jest.setTimeout(30000);
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(204)

            const blogsNow = await helper.blogsInDb()

            expect(blogsNow.length).toBe(helper.initialBlogs.length - 1)

            const titles = blogsNow.map(b => b.title)
            expect(titles).not.toContain(blogsNow.title)
        })
    })

    describe('updating a blog likes', () => {
        test('a blog can be updated', async () => {
            jest.setTimeout(30000);
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]

            const updatedBlog = {
                title: blogToUpdate.title,
                author: blogToUpdate.author,
                url: blogToUpdate.url,
                likes: 30
            }

            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(updatedBlog)
                .expect(200)

            const blogsNow = await helper.blogsInDb()

            expect(blogsNow.length).toBe(helper.initialBlogs.length)
            expect(blogsNow[0].likes).not.toBe(helper.initialBlogs[0].likes)
        })
    })
})

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const user = new User({ username: 'root', password: 'sekret1' })
        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Saffran',
            name: 'Stefano Saffran',
            password: 'fullstack1',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toBe(usersAtStart.length)
    })

    test('creation fails if username\'s length is less than three', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'ro',
            name: 'Superuser',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toBe(usersAtStart.length)
    })

    test.skip('creation fails if password don\'t fulfill the requirements', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'qwerty',
            name: 'Superuser',
            password: '123456',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toBe(usersAtStart.length)
    })
})
afterAll(() => {
    mongoose.connection.close()
})