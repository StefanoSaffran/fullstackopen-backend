var _ = require('lodash');

const dummy = (blogs) => {
    return 1;
}

const totalLikes = blogs => {
    const reducer = (sum, item) => {
        return sum + item.likes
    }

    return blogs.length === 0
        ? 0
        : blogs.reduce(reducer, 0)
}

const favoriteBlog = blogs => {
    const mostLikedBlog = blogs.reduce((max, item) => Math.max(max, item.likes), 0)
    const fb = blogs.find(blog => blog.likes === mostLikedBlog)

    const result = {}
    result.title = fb.title;
    result.author = fb.author;
    result.likes = fb.likes;

    console.log(result);
    return result

}

const mostBlogs = blogs => {

    blogs.forEach(blog => blog.blogs = 1);
    var output =
        _(blogs)
            .groupBy('author')
            .map((objs, key) => ({
                'author': key,
                'blogs': _.sumBy(objs, 'blogs')
            }))
            .value();

    const max = output.reduce((result, item) => Math.max(result, item.blogs), 0)
    const result = output.find(author => author.blogs == max)
    console.log(result);
    return result;
}
const mostLikes = blogs => {
    var output =
        _(blogs)
            .groupBy('author')
            .map((objs, key) => ({
                'author': key,
                'likes': _.sumBy(objs, 'likes')
            }))
            .value();


    const max = output.reduce((result, item) => Math.max(result, item.likes), 0)
    const result = output.find(author => author.likes == max)
    console.log(result);
    return result;
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}