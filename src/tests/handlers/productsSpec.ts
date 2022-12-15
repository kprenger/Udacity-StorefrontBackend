import supertest from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'

import productsRoutes from '../../handlers/products'

const app = express()
app.use(bodyParser.json())
productsRoutes(app)

describe('Products API', () => {
  describe('Index route', () => {
    it('should respond with 200', () => {
      return supertest(app).get('/api/products').expect(200)
    })
  })

  describe('Show route', () => {
    it('should respond with 200', () => {
      return supertest(app).get('/api/products/1').expect(200)
    })
  })

  describe('Popular Products route', () => {
    it('should respond with 200', () => {
      return supertest(app).get('/api/products/popular').expect(200)
    })
  })

  describe('Products Categories route', () => {
    it('should respond with 200', () => {
      return supertest(app).get('/api/products/categories').expect(200)
    })
  })

  describe('Create route', () => {
    it('should respond with 401 if not authorized', () => {
      return supertest(app).post('/api/products').expect(401)
    })
  })
})
