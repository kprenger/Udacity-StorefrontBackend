import client from '../database'
import { Product } from './product'

type OrderProduct = {
  product: Product
  quantity: number
}

export type Order = {
  id?: number
  status: string
  userId: number
  products: OrderProduct[]
}

type DBOrderResult = {
  order_id: number
  status: string
  user_id: number
  product_id: number
  name: string
  price: number
  category: string
  quantity: number
}

function parseDBOrderResult(orders: DBOrderResult[]): Order[] {
  const ordersResult: Order[] = []

  orders.forEach((dbOrder) => {
    const product: Product = {
      id: dbOrder.product_id,
      name: dbOrder.name,
      price: dbOrder.price,
      category: dbOrder.category
    }

    const orderProduct: OrderProduct = {
      product,
      quantity: dbOrder.quantity
    }

    const existingOrder = ordersResult.find(
      (order) => dbOrder.order_id === order.id
    )

    if (existingOrder) {
      existingOrder.products.push(orderProduct)
    } else {
      const newOrder: Order = {
        id: dbOrder.order_id,
        status: dbOrder.status,
        userId: dbOrder.user_id,
        products: [orderProduct]
      }

      ordersResult.push(newOrder)
    }
  })

  return ordersResult
}

export class OrderStore {
  async getOrdersForUser(
    userId: number,
    status: string,
    orderId?: number
  ): Promise<Order[]> {
    try {
      const conn = await client.connect()

      let sql = `
        SELECT orders.id AS order_id, orders.status, 
          users.id AS user_id, 
          products.id AS product_id, products.name, products.price, products.category, 
          order_products.quantity
        FROM orders
        INNER JOIN order_products
        ON orders.id = order_products.order_id
        INNER JOIN products
        ON order_products.product_id = products.id
        INNER JOIN users
        ON orders.user_id = users.id
        WHERE orders.user_id=($1) AND status=($2)
      `
      const params: Array<string | number> = [userId, status]

      if (orderId) {
        sql += ' AND order_id=($3)'
        params.push(orderId)
      }

      const result = await conn.query(sql, params)

      conn.release()

      return parseDBOrderResult(result.rows)
    } catch (err) {
      throw new Error(
        `Error getting ${status} orders for user ${userId}: ${err}`
      )
    }
  }

  async getActiveOrderForUser(userId: number): Promise<Order> {
    try {
      const orders = await this.getOrdersForUser(userId, 'active')
      return orders[0]
    } catch (err) {
      throw new Error(`Error getting active orders for user ${userId}: ${err}`)
    }
  }

  async getCompletedOrdersForUser(userId: number): Promise<Order[]> {
    try {
      return await this.getOrdersForUser(userId, 'complete')
    } catch (err) {
      throw new Error(`Error getting active orders for user ${userId}: ${err}`)
    }
  }

  async addProductToOrder(
    userId: number,
    productId: number,
    quantity: number
  ): Promise<Order> {
    try {
      const conn = await client.connect()

      let orderId = -1

      const currentOrderResult = await conn.query(
        'SELECT id FROM orders WHERE user_id=($1) AND status=($2) LIMIT 1',
        [userId, 'active']
      )

      if (currentOrderResult.rows[0] && currentOrderResult.rows[0].id) {
        orderId = currentOrderResult.rows[0].id
      } else {
        const newOrderResult = await conn.query(
          'INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING *',
          [userId, 'active']
        )
        orderId = newOrderResult.rows[0].id
      }

      const sql =
        'INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *'
      await conn.query(sql, [orderId, productId, quantity])

      conn.release()

      return this.getActiveOrderForUser(userId)
    } catch (err) {
      throw new Error(`Unable to add Product ${productId} to order: ${err}`)
    }
  }

  async submitCurrentOrder(userId: number): Promise<Order> {
    try {
      const currentOrder = await this.getActiveOrderForUser(userId)

      const conn = await client.connect()
      const sql = 'UPDATE orders SET status=($1) WHERE id=($2) RETURNING *'

      await conn.query(sql, ['complete', currentOrder.id])

      conn.release()

      const result = await this.getOrdersForUser(
        userId,
        'complete',
        currentOrder.id
      )

      return result[0]
    } catch (err) {
      throw new Error(`Unable to complete current Order: ${err}`)
    }
  }
}
