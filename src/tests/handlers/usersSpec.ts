import supertest from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'

import usersRoutes from '../../handlers/users'

const app = express()
app.use(bodyParser.json())
usersRoutes(app)

describe('Users API', () => {
  describe('Index route', () => {
    it('should respond with 401 if not authorized', () => {
      return supertest(app).get('/api/users').expect(401)
    })
  })

  describe('Show route', () => {
    it('should respond with 401 if not authorized', () => {
      return supertest(app).get('/api/users/1').expect(401)
    })
  })

  describe('Create route', () => {
    it('should respond with 401 if not authorized', () => {
      return supertest(app).post('/api/users').expect(401)
    })
  })

  describe('Register route', () => {
    it('should respond with JWT', async () => {
      supertest(app)
        .post('/api/users/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          username: 'tuser1',
          password: 'Password1'
        })
        .expect(200)
        .then((res) => {
          expect(typeof res.body).toEqual('string')
        })
    })
  })

  describe('Authenticate route', () => {
    it('should return error message if no username/password provided', () => {
      return supertest(app)
        .post('/api/users/authenticate')
        .expect(200)
        .then((res) =>
          expect(res.body.message).toEqual(
            'Incorrect username or password. Please try again.'
          )
        )
    })
  })
})
