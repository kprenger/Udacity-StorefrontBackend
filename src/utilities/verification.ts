import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { parseError } from './errorParser'

const { JWT_SECRET } = process.env

export function verifyAuthToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization ?? 'Bearer: BadToken'
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET ?? '')

    if (typeof decoded === 'object' && decoded.user && decoded.user.id) {
      res.locals.userId = decoded.user.id
    }

    next()
  } catch (err) {
    res.status(401)
    res.json(parseError(err))
  }
}

export function verifyCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (parseInt(req.params.id) !== res.locals.userId) {
    res.status(401)
    res.json({ message: 'You cannot perform this request on a different user' })
  } else {
    next()
  }
}
