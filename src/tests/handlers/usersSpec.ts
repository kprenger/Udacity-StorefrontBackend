import supertest from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'

import usersRoutes from '../../handlers/users'

const app = express()
app.use(bodyParser.json())
usersRoutes(app)

let token = ''
const password = 'Password1'

describe('Users API', () => {
  beforeAll(async () => {
    const tokenRes = await supertest(app).post('/api/users/register').send({
      firstName: 'Test',
      lastName: 'User',
      username: 'tuser1',
      password
    })

    token = tokenRes.body
  })

  describe('Index route', () => {
    it('should respond with 200 if authorized', () => {
      return supertest(app)
        .get('/api/users')
        .set('Authorization', `Bearer: ${token}`)
        .expect(200)
    })

    it('should respond with 401 if not authorized', () => {
      return supertest(app).get('/api/users').expect(401)
    })
  })

  describe('Show route', () => {
    it('should respond with 200 if authorized', () => {
      return supertest(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer: ${token}`)
        .expect(200)
    })

    it('should respond with 401 if not authorized', () => {
      return supertest(app).get('/api/users/1').expect(401)
    })
  })

  describe('Create route', () => {
    it('should respond with 200 if authorized', () => {
      return supertest(app)
        .post('/api/users')
        .set('Authorization', `Bearer: ${token}`)
        .send({
          firstName: 'Test',
          lastName: 'User2',
          username: 'tuser2',
          password
        })
        .expect(200)
    })

    it('should respond with 401 if not authorized', () => {
      return supertest(app).post('/api/users').expect(401)
    })
  })

  describe('Register route', () => {
    it('should respond with JWT and return 200', async () => {
      supertest(app)
        .post('/api/users/register')
        .send({
          firstName: 'Test',
          lastName: 'User3',
          username: 'tuser3',
          password
        })
        .expect(200)
        .then((res) => {
          expect(typeof res.body).toEqual('string')
        })
    })
  })

  describe('Authenticate route', () => {
    it('should respond with JWT and return 200', () => {
      return supertest(app)
        .post('/api/users/authenticate')
        .set('Authorization', `Bearer: ${token}`)
        .send({ username: 'tuser1', password })
        .expect(200)
        .then((res) => {
          expect(typeof res.body).toEqual('string')
        })
    })

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
