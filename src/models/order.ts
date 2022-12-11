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

const getOrdersByStatusSql = `
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

export class OrderStore {
  async getActiveOrderForUser(userId: number): Promise<Order[]> {
    try {
      const conn = await client.connect()
      const result = await conn.query(getOrdersByStatusSql, [userId, 'active'])

      conn.release()

      return parseDBOrderResult(result.rows)
    } catch (err) {
      throw new Error(`Error getting active orders for user ${userId}: ${err}`)
    }
  }

  async getCompletedOrdersForUser(userId: number): Promise<Order[]> {
    try {
      const conn = await client.connect()
      const result = await conn.query(getOrdersByStatusSql, [
        userId,
        'complete'
      ])

      conn.release()

      return parseDBOrderResult(result.rows)
    } catch (err) {
      throw new Error(`Error getting active orders for user ${userId}: ${err}`)
    }
  }

  // async addProductToOrder(
  //   userId: number,
  //   productId: number,
  //   quantity: number
  // ): Promise<Order> {
  //   try {
  //     const conn = await client.connect()

  //     let sql = ''

  //     const currentOrderResult = await conn.query('SELECT id FROM orders WHERE status="active"')

  //     if (currentOrderResult.rows[0] && currentOrderResult.rows[0].id) {
  //       const orderId = currentOrderResult.rows[0]
  //       sql = 'UPDATE orders SET '
  //     } else {

  //     }
  //   }
  // }
}
