import supertest from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'

import ordersRoutes from '../../handlers/orders'

const app = express()
app.use(bodyParser.json())
ordersRoutes(app)

describe('Orders API', () => {
  describe('Current Order route', () => {
    it('should respond with 401 if not authorized', () => {
      return supertest(app).get('/api/users/1/orders/current').expect(401)
    })
  })

  describe('Completed Order route', () => {
    it('should respond with 401 if not authorized', () => {
      return supertest(app).get('/api/users/1/orders/complete').expect(401)
    })
  })

  describe('Add Product to Order route', () => {
    it('should respond with 401 if not authorized', () => {
      return supertest(app).post('/api/users/1/orders/add').expect(401)
    })
  })

  describe('Submit Order route', () => {
    it('should respond with 401 if not authorized', () => {
      return supertest(app).post('/api/users/1/orders/submit').expect(401)
    })
  })
})
