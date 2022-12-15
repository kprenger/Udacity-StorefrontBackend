import supertest from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'

import ordersRoutes from '../../handlers/orders'
import usersRoutes from '../../handlers/users'
import productsRoutes from '../../handlers/products'

const app = express()
app.use(bodyParser.json())
ordersRoutes(app)
usersRoutes(app)
productsRoutes(app)

let token = ''
let productId = 0

describe('Orders API', () => {
  beforeAll(async () => {
    const tokenRes = await supertest(app).post('/api/users/register').send({
      firstName: 'Test',
      lastName: 'User',
      username: 'tuser1',
      password: 'Password1'
    })

    token = tokenRes.body

    const productRes = await supertest(app)
      .post('/api/products')
      .set('Authorization', `Bearer: ${token}`)
      .send({
        name: 'Computere',
        price: '2000.00',
        category: 'electronics'
      })

    productId = productRes.body.id
  })

  describe('Current Order route', () => {
    it('should respond with 200 if authorized', () => {
      return supertest(app)
        .get('/api/users/1/orders/current')
        .set('Authorization', `Bearer: ${token}`)
        .expect(200)
    })

    it('should respond with 401 if not authorized', () => {
      return supertest(app).get('/api/users/1/orders/current').expect(401)
    })
  })

  describe('Completed Order route', () => {
    it('should respond with 200 if authorized', () => {
      return supertest(app)
        .get('/api/users/1/orders/complete')
        .set('Authorization', `Bearer: ${token}`)
        .expect(200)
    })

    it('should respond with 401 if not authorized', () => {
      return supertest(app).get('/api/users/1/orders/complete').expect(401)
    })
  })

  describe('Add Product to Order route', () => {
    it('should respond with 200 if authorized', () => {
      return supertest(app)
        .post('/api/users/1/orders/add')
        .set('Authorization', `Bearer: ${token}`)
        .send({
          productId: productId,
          quantity: 5
        })
        .expect(200)
    })

    it('should respond with 401 if not authorized', () => {
      return supertest(app).post('/api/users/1/orders/add').expect(401)
    })
  })

  describe('Submit Order route', () => {
    it('should respond with 200 if authorized', () => {
      return supertest(app)
        .post('/api/users/1/orders/submit')
        .set('Authorization', `Bearer: ${token}`)
        .expect(200)
    })

    it('should respond with 401 if not authorized', () => {
      return supertest(app).post('/api/users/1/orders/submit').expect(401)
    })
  })
})
