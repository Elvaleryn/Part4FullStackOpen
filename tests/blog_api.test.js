const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require("../models/bloglist")
const api = supertest(app)

const initialBlogs = [
  {
    title: "heyyoooo",
  	author: "mahmut",
  	url: "bomba.com",
  	likes: 8
  },
  {
   	title: "hüsrav",
  	author: "cenap",
  	url: "sadf.com",
  	likes: 10
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObject = initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObject.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test("a blog can be added", async() => {
	const newBlog = {
		title: "deneme",
		author:"Elvaleryn",
		url:"ek.com",
		likes: 20
	}
	await api
	.post("/api/blogs")
	.send(newBlog)
	.expect(201)
    .expect('Content-Type', /application\/json/)
	const response = await api.get('/api/blogs')

  	const contents = response.body.map(r => r.title)

  	expect(response.body.length).toBe(initialBlogs.length + 1)
  	expect(contents).toContain("deneme")
	
})

test("view a specific blog", async() => {
	const blogsAtStart = await Blog.find({})
	const blogs = blogsAtStart.map(blog => blog.toJSON())

  	const blogToView= blogs[0]

  	const resultBlog = await api
    	.get(`/api/blogs/${blogToView.id}`)
    	.expect(200)
    	.expect('Content-Type', /application\/json/)

  		expect(resultBlog.body).toEqual(blogToView)
	})

test("likes to be set to 0", async() => {
	const newBlog = {
		title: "nolike",
		author:"Hüsamettin",
		url:"ek.com",
		likes: undefined
	}
	await api
	.post("/api/blogs")
	.send(newBlog)
	.expect(201)
    .expect('Content-Type', /application\/json/)
	const response = await api.get('/api/blogs')

  	const like = response.body.map(r => r.likes)
	
	expect(response.body.length).toBe(initialBlogs.length + 1)
  	expect(like[2]).toEqual(0)
})

test("author is undefined", async() => {
	const newBlog = {
		title: "nolike",
		url:"ek.com",
		likes: 5
	}
	await api
	.post("/api/blogs")
	.send(newBlog)
	.expect(400)
})
afterAll(() => {
  mongoose.connection.close()
})