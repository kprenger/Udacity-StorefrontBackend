import express, { Request, Response } from 'express'

import { UserStore } from '../models/user'
import { parseError } from '../utilities/errorParser'

const userStore = new UserStore()

const index = async (req: Request, res: Response) => {
  try {
    const users = await userStore.index()
    res.json(users)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const usersRoutes = (app: express.Application) => {
  app.get('/api/users', index)
}

export default usersRoutes
