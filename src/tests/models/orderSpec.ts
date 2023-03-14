import client from '../../database'
import ordersRoutes from '../../handlers/orders'
import { OrderStore } from '../../models/order'
import { ProductStore, Product } from '../../models/product'
import { UserStore, User } from '../../models/user'

const orderStore = new OrderStore()
const userStore = new UserStore()
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

const user1: User = {
  firstName: 'Test',
  lastName: 'User1',
  username: 'tuser1',
  password: 'password123'
}

describe('Order Model', () => {
  afterEach(async () => {
    const conn = await client.connect()
    await conn.query('DELETE FROM order_products')
    await conn.query('DELETE FROM orders')
    await conn.query('DELETE FROM products')
    await conn.query('DELETE FROM users')
    conn.release()
  })

  describe('getActiveOrderForUser', () => {
    it('should return the current active order', async () => {
      const productResults = await Promise.all([
        productStore.create(product1),
        productStore.create(product2),
        productStore.create(product3)
      ])

      const newUser = await userStore.create(user1)

      await orderStore.addProductToOrder(newUser.id!, productResults[0].id!, 20)
      await orderStore.addProductToOrder(newUser.id!, productResults[1].id!, 1)
      await orderStore.addProductToOrder(newUser.id!, productResults[2].id!, 25)

      const order = await orderStore.getActiveOrderForUser(newUser.id!)
      const orderProductNames = order.products.map((item) => item.product.name)

      expect(order.status).toBe('active')
      expect(order.userId).toEqual(newUser.id!)
      expect(order.products.length).toBe(3)
      expect(orderProductNames.includes(product1.name)).toBeTrue()
    })
  })

  describe('getCompletedOrdersForUser', () => {
    it('should return the completed orders', async () => {
      const productResults = await Promise.all([
        productStore.create(product1),
        productStore.create(product2),
        productStore.create(product3)
      ])

      const newUser = await userStore.create(user1)

      await orderStore.addProductToOrder(newUser.id!, productResults[0].id!, 20)
      await orderStore.submitCurrentOrder(newUser.id!)

      await orderStore.addProductToOrder(newUser.id!, productResults[0].id!, 20)
      await orderStore.submitCurrentOrder(newUser.id!)

      await orderStore.addProductToOrder(newUser.id!, productResults[0].id!, 20)
      await orderStore.submitCurrentOrder(newUser.id!)

      await orderStore.addProductToOrder(newUser.id!, productResults[0].id!, 20)

      const orders = await orderStore.getCompletedOrdersForUser(newUser.id!)
      const orderStatuses = orders.map((item) => item.status)

      expect(orders.length).toBe(3)
      expect(orderStatuses).toEqual(['complete', 'complete', 'complete'])
    })
  })

  describe('addProductToOrder', () => {
    it('should add products to the order', async () => {
      const productResults = await Promise.all([
        productStore.create(product1),
        productStore.create(product2),
        productStore.create(product3)
      ])

      const newUser = await userStore.create(user1)

      await orderStore.addProductToOrder(newUser.id!, productResults[0].id!, 20)

      let order = await orderStore.getActiveOrderForUser(newUser.id!)

      expect(order.products.length).toBe(1)
      expect(order.products[0].quantity).toBe(20)
      expect(order.products[0].product.name).toEqual(product1.name)

      await orderStore.addProductToOrder(newUser.id!, productResults[1].id!, 25)

      order = await orderStore.getActiveOrderForUser(newUser.id!)

      expect(order.products.length).toBe(2)
    })
  })

  describe('submitCurrentOrder', () => {
    it('should submit the order', async () => {
      const productResults = await Promise.all([
        productStore.create(product1),
        productStore.create(product2),
        productStore.create(product3)
      ])

      const newUser = await userStore.create(user1)

      await orderStore.addProductToOrder(newUser.id!, productResults[0].id!, 20)
      await orderStore.addProductToOrder(newUser.id!, productResults[1].id!, 25)

      let order = await orderStore.getActiveOrderForUser(newUser.id!)
      const orderId = order.id

      expect(order).not.toBeUndefined()
      expect(order.status).toBe('active')

      await orderStore.submitCurrentOrder(newUser.id!)

      order = await orderStore.getActiveOrderForUser(newUser.id!)

      expect(order).toBeUndefined()

      const orders = await orderStore.getCompletedOrdersForUser(newUser.id!)

      expect(orders.length).toBe(1)
      expect(orders[0].id).toEqual(orderId)
      expect(orders[0].status).toEqual('complete')
    })
  })
})
