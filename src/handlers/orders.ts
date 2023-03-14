import express, { Request, Response } from 'express'
import { OrderStore } from '../models/order'

import { parseError } from '../utilities/errorParser'
import { verifyAuthToken, verifyCurrentUser } from '../utilities/verification'

const orderStore = new OrderStore()

const getActiveOrderForUser = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.send('No user ID specified')
    return
  }

  try {
    const order = await orderStore.getActiveOrderForUser(
      parseInt(req.params.id)
    )
    res.json(
      order ? order : { message: `No active order for User ${req.params.id}` }
    )
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const getCompleteOrdersForUser = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.send('No user ID specified')
    return
  }

  try {
    const orders = await orderStore.getCompletedOrdersForUser(
      parseInt(req.params.id)
    )
    res.json(orders)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const addProductToOrder = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.send('No user ID specified')
    return
  }

  try {
    const orders = await orderStore.addProductToOrder(
      parseInt(req.params.id),
      parseInt(req.body.productId),
      parseInt(req.body.quantity)
    )
    res.json(orders)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const removeProductFromOrder = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.send('No user ID specified')
    return
  }

  try {
    const orders = await orderStore.removeProductFromOrder(
      parseInt(req.params.id),
      parseInt(req.body.productId)
    )
    res.json(orders)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const updateProductQuantityInOrder = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.send('No user ID specified')
    return
  }

  try {
    const orders = await orderStore.updateProductQuantityInOrder(
      parseInt(req.params.id),
      parseInt(req.body.productId),
      parseInt(req.body.quantity)
    )
    res.json(orders)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const submitCurrentOrder = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.send('No user ID specified')
    return
  }

  try {
    const orders = await orderStore.submitCurrentOrder(parseInt(req.params.id))
    res.json(orders)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const ordersRoutes = (app: express.Application) => {
  app.get(
    '/api/users/:id/orders/current',
    verifyAuthToken,
    verifyCurrentUser,
    getActiveOrderForUser
  )
  app.get(
    '/api/users/:id/orders/complete',
    verifyAuthToken,
    verifyCurrentUser,
    getCompleteOrdersForUser
  )
  app.post(
    '/api/users/:id/orders/add',
    verifyAuthToken,
    verifyCurrentUser,
    addProductToOrder
  )
  app.post(
    '/api/users/:id/orders/remove',
    verifyAuthToken,
    verifyCurrentUser,
    removeProductFromOrder
  )
  app.post(
    '/api/users/:id/orders/update',
    verifyAuthToken,
    verifyCurrentUser,
    updateProductQuantityInOrder
  )
  app.post(
    '/api/users/:id/orders/submit',
    verifyAuthToken,
    verifyCurrentUser,
    submitCurrentOrder
  )
}

export default ordersRoutes
