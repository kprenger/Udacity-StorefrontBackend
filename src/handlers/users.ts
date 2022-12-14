import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { UserStore, User } from '../models/user'
import { parseError } from '../utilities/errorParser'
import { verifyAuthToken } from '../utilities/verification'

const userStore = new UserStore()
const { JWT_SECRET } = process.env

const index = async (req: Request, res: Response) => {
  try {
    const users = await userStore.index()
    res.json(users)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const show = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.send('No user ID specified')
    return
  }

  try {
    const user = await userStore.show(req.params.id as unknown as number)
    res.json(user ? user : { message: `No user with id ${req.params.id}` })
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const create = async (req: Request, res: Response) => {
  try {
    const user: User = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: req.body.password
    }

    const result = await userStore.create(user)
    const token = jwt.sign({ user: result }, JWT_SECRET ?? '')

    res.json(token)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const authenticate = async (req: Request, res: Response) => {
  try {
    const result = await userStore.authenticate(
      req.body.username,
      req.body.password
    )

    if (result) {
      const token = jwt.sign({ user: result }, JWT_SECRET ?? '')

      res.json(token)
    } else {
      res.json({ message: 'Incorrect username or password. Please try again.' })
    }
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const usersRoutes = (app: express.Application) => {
  app.get('/api/users', verifyAuthToken, index)
  app.get('/api/users/:id', verifyAuthToken, show)
  app.post('/api/users', verifyAuthToken, create)
  app.post('/api/users/register', create)
  app.post('/api/users/authenticate', authenticate)
}

export default usersRoutes
