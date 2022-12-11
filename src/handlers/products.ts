import express, { Request, Response } from 'express'

import { ProductStore, Product } from '../models/product'
import { parseError } from '../utilities/errorParser'

const productStore = new ProductStore()

const index = async (req: Request, res: Response) => {
  try {
    const users = await productStore.index(req.query.category as string)
    res.json(users)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const show = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.send('No product ID specified')
    return
  }

  try {
    const product = await productStore.show(req.params.id as unknown as number)
    res.json(product)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const create = async (req: Request, res: Response) => {
  try {
    const product: Product = {
      name: req.body.name,
      price: req.body.price,
      category: req.body.category
    }

    const result = await productStore.create(product)
    res.json(result)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const getProductCategories = async (req: Request, res: Response) => {
  try {
    const categories = await productStore.getProductCategories()
    res.json(categories)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const productsRoutes = (app: express.Application) => {
  app.get('/api/products', index)
  app.get('/api/products/categories', getProductCategories)
  app.get('/api/products/:id', show)
  app.post('/api/products', create)
}

export default productsRoutes
