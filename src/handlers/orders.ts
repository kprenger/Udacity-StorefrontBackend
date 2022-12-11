import express, { Request, Response } from 'express'
import { OrderStore } from '../models/order'

import { parseError } from '../utilities/errorParser'

const orderStore = new OrderStore()

const getActiveOrderForUser = async (req: Request, res: Response) => {
  try {
    const orders = await orderStore.getActiveOrderForUser(1)
    res.json(orders)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const getCompleteOrdersForUser = async (req: Request, res: Response) => {
  try {
    const orders = await orderStore.getCompletedOrdersForUser(1)
    res.json(orders)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const ordersRoutes = (app: express.Application) => {
  app.get('/api/users/:id/orders/current', getActiveOrderForUser)
  app.get('/api/users/:id/orders/complete', getCompleteOrdersForUser)
}

export default ordersRoutes
