import client from '../../database'
import { OrderStore } from '../../models/order'
import { ProductStore, Product } from '../../models/product'
import { UserStore, User } from '../../models/user'

const productStore = new ProductStore()

const product1: Product = {
  name: 'Product 1',
  price: 10.99,
  category: 'category 1',
  url: 'http://www.google.com/product1.jpg',
  description: 'Describe Product 1'
}

const product2: Product = {
  name: 'Product 2',
  price: 0.99,
  category: 'category 2',
  url: 'http://www.google.com/product2.jpg',
  description: 'Describe Product 2'
}

const product3: Product = {
  name: 'Product 3',
  price: 100.0,
  category: 'category 3',
  url: 'http://www.google.com/product3.jpg',
  description: 'Describe Product 3'
}

describe('Product Model', () => {
  afterEach(async () => {
    const conn = await client.connect()
    await conn.query('DELETE FROM order_products')
    await conn.query('DELETE FROM orders')
    await conn.query('DELETE FROM products')
    await conn.query('DELETE FROM users')
    conn.release()
  })

  describe('index method', () => {
    it('should return an empty array if no products', async () => {
      const results = await productStore.index()

      expect(results.length).toBe(0)
    })

    it('should return all products', async () => {
      await Promise.all([
        productStore.create(product1),
        productStore.create(product2),
        productStore.create(product3)
      ])

      const results = await productStore.index()
      const resultNames = results.map((item) => item.name)

      expect(resultNames.includes(product1.name)).toBeTrue()
      expect(resultNames.includes(product2.name)).toBeTrue()
      expect(resultNames.includes(product3.name)).toBeTrue()
    })

    it('should return products for specific category', async () => {
      await Promise.all([
        productStore.create(product1),
        productStore.create(product2),
        productStore.create(product3)
      ])

      const results = await productStore.index(product2.category)
      const resultNames = results.map((item) => item.name)

      expect(resultNames.includes(product1.name)).toBeFalse()
      expect(resultNames.includes(product2.name)).toBeTrue()
      expect(resultNames.includes(product3.name)).toBeFalse()
    })
  })

  describe('show method', () => {
    it('should return undefined if nothing found', async () => {
      const result = await productStore.show(999)
      expect(result).toBeUndefined()
    })

    it('should return a specific product', async () => {
      await Promise.all([
        productStore.create(product1),
        productStore.create(product2)
      ])

      const newProduct = await productStore.create(product3)
      const result = await productStore.show(newProduct.id!)

      expect(result?.name).toEqual(product3.name)
    })
  })

  describe('create method', () => {
    it('should create new product', async () => {
      const newProduct = await productStore.create(product1)

      expect(newProduct.name).toEqual(product1.name)

      const returnProduct = await productStore.show(newProduct.id!)

      expect(returnProduct?.name).toEqual(product1.name)
    })
  })

  describe('getProductCategories', () => {
    it('should return all available product categories', async () => {
      await Promise.all([
        productStore.create(product1),
        productStore.create(product2),
        productStore.create(product3)
      ])

      const categories = await productStore.getProductCategories()

      expect(categories.includes(product1.category)).toBeTrue()
      expect(categories.includes(product2.category)).toBeTrue()
      expect(categories.includes(product3.category)).toBeTrue()
    })

    it('should return empty array if no products', async () => {
      const categories = await productStore.getProductCategories()

      expect(categories.length).toBe(0)
    })

    it('should only return distinct categories', async () => {
      await Promise.all([
        productStore.create(product1),
        productStore.create(product1),
        productStore.create(product1)
      ])

      const categories = await productStore.getProductCategories()

      expect(categories.length).toBe(1)
      expect(categories[0]).toEqual(product1.category)
    })
  })

  describe('getPopularProducts', () => {
    const userStore = new UserStore()
    const orderStore = new OrderStore()

    const user1: User = {
      firstName: 'Test',
      lastName: 'User1',
      username: 'tuser1',
      password: 'password123'
    }

    const product4: Product = {
      name: 'Product 4',
      price: 100.99,
      category: 'category 4',
      url: 'http://www.google.com/product4.jpg',
      description: 'Describe Product 4'
    }

    const product5: Product = {
      name: 'Product 5',
      price: 1.25,
      category: 'category 5',
      url: 'http://www.google.com/product5.jpg',
      description: 'Describe Product 5'
    }

    const product6: Product = {
      name: 'Product 6',
      price: 20.25,
      category: 'category 6',
      url: 'http://www.google.com/product6.jpg',
      description: 'Describe Product 6'
    }

    it('should return the 5 most sold products', async () => {
      const productResults = await Promise.all([
        productStore.create(product1),
        productStore.create(product2),
        productStore.create(product3),
        productStore.create(product4),
        productStore.create(product5),
        productStore.create(product6)
      ])

      const newUser = await userStore.create(user1)

      await Promise.all([
        orderStore.addProductToOrder(newUser.id!, productResults[0].id!, 20),
        orderStore.addProductToOrder(newUser.id!, productResults[1].id!, 1),
        orderStore.addProductToOrder(newUser.id!, productResults[2].id!, 25),
        orderStore.addProductToOrder(newUser.id!, productResults[3].id!, 10),
        orderStore.addProductToOrder(newUser.id!, productResults[4].id!, 12),
        orderStore.addProductToOrder(newUser.id!, productResults[5].id!, 15)
      ])

      const popularProds = await productStore.getPopularProducts()
      const popularProdsNames = popularProds.map((item) => item.name)

      expect(popularProds.length).toBe(5)
      expect(popularProdsNames.includes(productResults[0].name)).toBeTrue()
      expect(popularProdsNames.includes(productResults[1].name)).toBeFalse()
      expect(popularProdsNames.includes(productResults[2].name)).toBeTrue()
      expect(popularProdsNames.includes(productResults[3].name)).toBeTrue()
      expect(popularProdsNames.includes(productResults[4].name)).toBeTrue()
      expect(popularProdsNames.includes(productResults[5].name)).toBeTrue()
    })

    it('should accept a limit', async () => {
      const productResults = await Promise.all([
        productStore.create(product1),
        productStore.create(product2),
        productStore.create(product3),
        productStore.create(product4),
        productStore.create(product5),
        productStore.create(product6)
      ])

      const newUser = await userStore.create(user1)

      await Promise.all([
        orderStore.addProductToOrder(newUser.id!, productResults[0].id!, 20),
        orderStore.addProductToOrder(newUser.id!, productResults[1].id!, 1),
        orderStore.addProductToOrder(newUser.id!, productResults[2].id!, 25),
        orderStore.addProductToOrder(newUser.id!, productResults[3].id!, 10),
        orderStore.addProductToOrder(newUser.id!, productResults[4].id!, 12),
        orderStore.addProductToOrder(newUser.id!, productResults[5].id!, 15)
      ])

      const popularProds = await productStore.getPopularProducts(2)
      const popularProdsNames = popularProds.map((item) => item.name)

      expect(popularProds.length).toBe(2)
      expect(popularProdsNames.includes(productResults[0].name)).toBeTrue()
      expect(popularProdsNames.includes(productResults[1].name)).toBeFalse()
      expect(popularProdsNames.includes(productResults[2].name)).toBeTrue()
      expect(popularProdsNames.includes(productResults[3].name)).toBeFalse()
      expect(popularProdsNames.includes(productResults[4].name)).toBeFalse()
      expect(popularProdsNames.includes(productResults[5].name)).toBeFalse()
    })

    it('should accept a category', async () => {
      product6.category = product5.category

      const productResults = await Promise.all([
        productStore.create(product1),
        productStore.create(product2),
        productStore.create(product3),
        productStore.create(product4),
        productStore.create(product5),
        productStore.create(product6)
      ])

      const newUser = await userStore.create(user1)

      await Promise.all([
        orderStore.addProductToOrder(newUser.id!, productResults[0].id!, 20),
        orderStore.addProductToOrder(newUser.id!, productResults[1].id!, 1),
        orderStore.addProductToOrder(newUser.id!, productResults[2].id!, 25),
        orderStore.addProductToOrder(newUser.id!, productResults[3].id!, 10),
        orderStore.addProductToOrder(newUser.id!, productResults[4].id!, 12),
        orderStore.addProductToOrder(newUser.id!, productResults[5].id!, 15)
      ])

      const popularProds = await productStore.getPopularProducts(
        undefined,
        product5.category
      )
      const popularProdsNames = popularProds.map((item) => item.name)

      expect(popularProds.length).toBe(2)
      expect(popularProdsNames.includes(productResults[0].name)).toBeFalse()
      expect(popularProdsNames.includes(productResults[1].name)).toBeFalse()
      expect(popularProdsNames.includes(productResults[2].name)).toBeFalse()
      expect(popularProdsNames.includes(productResults[3].name)).toBeFalse()
      expect(popularProdsNames.includes(productResults[4].name)).toBeTrue()
      expect(popularProdsNames.includes(productResults[5].name)).toBeTrue()
    })

    it('should accept a limit and a category', async () => {
      product6.category = product5.category
      product4.category = product5.category
      product3.category = product5.category

      const productResults = await Promise.all([
        productStore.create(product1),
        productStore.create(product2),
        productStore.create(product3),
        productStore.create(product4),
        productStore.create(product5),
        productStore.create(product6)
      ])

      const newUser = await userStore.create(user1)

      await Promise.all([
        orderStore.addProductToOrder(newUser.id!, productResults[0].id!, 20),
        orderStore.addProductToOrder(newUser.id!, productResults[1].id!, 1),
        orderStore.addProductToOrder(newUser.id!, productResults[2].id!, 25),
        orderStore.addProductToOrder(newUser.id!, productResults[3].id!, 10),
        orderStore.addProductToOrder(newUser.id!, productResults[4].id!, 12),
        orderStore.addProductToOrder(newUser.id!, productResults[5].id!, 15)
      ])

      const popularProds = await productStore.getPopularProducts(
        2,
        product5.category
      )
      const popularProdsNames = popularProds.map((item) => item.name)

      expect(popularProds.length).toBe(2)
      expect(popularProdsNames.includes(productResults[0].name)).toBeFalse()
      expect(popularProdsNames.includes(productResults[1].name)).toBeFalse()
      expect(popularProdsNames.includes(productResults[2].name)).toBeTrue()
      expect(popularProdsNames.includes(productResults[3].name)).toBeFalse()
      expect(popularProdsNames.includes(productResults[4].name)).toBeFalse()
      expect(popularProdsNames.includes(productResults[5].name)).toBeTrue()
    })
  })
})
