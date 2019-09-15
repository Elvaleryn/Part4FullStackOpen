const blogListRouter = require("express").Router()
const Blog = require("../models/bloglist")
const jwt = require('jsonwebtoken')
const User = require('../models/user')

blogListRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({}).populate("user", {
		username: 1,
		name: 1
	})
	response.json(blogs.map(blog => blog.toJSON()))
})

blogListRouter.get("/:id", async (request, response) => {
	const blog = await Blog.findById(request.params.id)
	response.json(blog.toJSON())
})

blogListRouter.post('/', async (request, response, next) => {

	const body = request.body

	try {

		const decodedToken = jwt.verify(request.token, process.env.SECRET)
		if (!request.token || !decodedToken.id) {
			return response.status(401)
				.json({
					error: 'token missing or invalid'
				})
		}
		const user = await User.findById(decodedToken.id)

		const blog = new Blog({
			title: body.title,
			author: body.author,
			url: body.url,
			likes: body.likes === undefined ? 0 : body.likes,
			user: user._id
		})
		const savedBlog = await blog.save()
		user.blogs = user.blogs.concat(savedBlog._id)
		await user.save()
		response.status(201).json(savedBlog.toJSON())
	} catch (exception) {
		next(exception)
	}
})

blogListRouter.delete("/:id", async (request, response, next) => {
	try {
		const decodedToken = jwt.verify(request.token, process.env.SECRET)
		if (!request.token || !decodedToken.id) {
			return response.status(401).json({
				error: 'token missing'
			})
		}

		const blog = await Blog.findById(request.params.id)

		if (!(blog.user.toString() === decodedToken.id)) {
			return response.status(401).json({
				error: 'user is not authorized to delete this blog'
			})
		}
		await Blog.findByIdAndRemove(request.params.id)
		response.status(204).end()
	} catch (exception) {
		next(exception)
	}
})

blogListRouter.put("/:id", async (request, response, next) => {
	const blog = request.body
	try {
		const updatedBlog = await Blog.findOneAndUpdate({ _id: request.params.id }, blog, { new: true })
		response.json(updatedBlog.toJSON())
	} catch (exception) {
		next(exception)
	}
})

module.exports = blogListRouter