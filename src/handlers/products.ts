import express, { Request, Response } from 'express'

import { ProductStore, Product } from '../models/product'
import { parseError } from '../utilities/errorParser'
import { verifyAuthToken } from '../utilities/verification'

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
    res.json(
      product ? product : { message: `No product with id ${req.params.id}` }
    )
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
      category: req.body.category,
      url: req.body.url,
      description: req.body.description
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

const getPopularProducts = async (req: Request, res: Response) => {
  try {
    const products = await productStore.getPopularProducts(
      parseInt(req.query.limit as string),
      req.query.category as string
    )
    res.json(products)
  } catch (err) {
    res.status(400)
    res.json(parseError(err))
  }
}

const productsRoutes = (app: express.Application) => {
  app.get('/api/products', index)
  app.get('/api/products/categories', getProductCategories)
  app.get('/api/products/popular', getPopularProducts)
  app.get('/api/products/:id', show)
  app.post('/api/products', verifyAuthToken, create)
}

export default productsRoutes
