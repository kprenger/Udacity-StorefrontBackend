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
  url: string
  description: string
  quantity: number
}

function parseDBOrderResult(orders: DBOrderResult[]): Order[] {
  const ordersResult: Order[] = []

  orders.forEach((dbOrder) => {
    const product: Product = {
      id: dbOrder.product_id,
      name: dbOrder.name,
      price: dbOrder.price,
      category: dbOrder.category,
      url: dbOrder.url,
      description: dbOrder.description
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

async function getOrdersForUser(
  userId: number,
  status: string,
  orderId?: number
): Promise<Order[]> {
  try {
    const conn = await client.connect()

    let sql = `
      SELECT orders.id AS order_id, orders.status, 
        users.id AS user_id, 
        products.id AS product_id, products.name, products.price, products.category, products.url, products.description, 
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
    throw new Error(`Error getting ${status} orders for user ${userId}: ${err}`)
  }
}

export class OrderStore {
  async getActiveOrderForUser(userId: number): Promise<Order> {
    try {
      const orders = await getOrdersForUser(userId, 'active')
      return orders[0]
    } catch (err) {
      throw new Error(`Error getting active orders for user ${userId}: ${err}`)
    }
  }

  async getCompletedOrdersForUser(userId: number): Promise<Order[]> {
    try {
      return await getOrdersForUser(userId, 'complete')
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

      // Check for existing order. Create if it doesn't exist.

      if (currentOrderResult.rows[0] && currentOrderResult.rows[0].id) {
        orderId = currentOrderResult.rows[0].id
      } else {
        const newOrderResult = await conn.query(
          'INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING *',
          [userId, 'active']
        )
        orderId = newOrderResult.rows[0].id
      }

      // Check if product already exists on order and update if it does. Otherwise, add new order_product.

      const currentOrderProductResult = await conn.query(
        'SELECT id, quantity FROM order_products WHERE order_id=($1) AND product_id=($2) LIMIT 1',
        [orderId, productId]
      )

      if (
        currentOrderProductResult.rows[0] &&
        currentOrderProductResult.rows[0].id &&
        currentOrderProductResult.rows[0].quantity
      ) {
        const sql = 'UPDATE order_products SET quantity=($1) WHERE id=($2)'
        const newQuantity =
          quantity + currentOrderProductResult.rows[0].quantity

        await conn.query(sql, [
          newQuantity,
          currentOrderProductResult.rows[0].id
        ])
      } else {
        const sql =
          'INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *'
        await conn.query(sql, [orderId, productId, quantity])
      }

      conn.release()

      return this.getActiveOrderForUser(userId)
    } catch (err) {
      throw new Error(`Unable to add Product ${productId} to order: ${err}`)
    }
  }

  async removeProductFromOrder(
    userId: number,
    productId: number
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
        throw new Error('User does not have an active order!')
      }

      const currentOrderProductResult = await conn.query(
        'SELECT id, quantity FROM order_products WHERE order_id=($1) AND product_id=($2) LIMIT 1',
        [orderId, productId]
      )

      if (
        currentOrderProductResult.rows[0] &&
        currentOrderProductResult.rows[0].id
      ) {
        const sql = 'DELETE FROM order_products WHERE id=($1)'
        await conn.query(sql, [currentOrderProductResult.rows[0].id])
      } else {
        throw new Error("The Product is not on the User's active order!")
      }

      conn.release()

      return this.getActiveOrderForUser(userId)
    } catch (err) {
      throw new Error(
        `Unable to remove Product ${productId} from order: ${err}`
      )
    }
  }

  async updateProductQuantityInOrder(
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

      // Check for existing order

      if (currentOrderResult.rows[0] && currentOrderResult.rows[0].id) {
        orderId = currentOrderResult.rows[0].id
      } else {
        throw new Error('User does not have an active order!')
      }

      // Check if product already exists on order and update if it does

      const currentOrderProductResult = await conn.query(
        'SELECT id, quantity FROM order_products WHERE order_id=($1) AND product_id=($2) LIMIT 1',
        [orderId, productId]
      )

      if (
        currentOrderProductResult.rows[0] &&
        currentOrderProductResult.rows[0].id
      ) {
        const sql = 'UPDATE order_products SET quantity=($1) WHERE id=($2)'
        await conn.query(sql, [quantity, currentOrderProductResult.rows[0].id])
      } else {
        throw new Error("The Product is not on the User's active order!")
      }

      conn.release()

      return this.getActiveOrderForUser(userId)
    } catch (err) {
      throw new Error(
        `Unable to update quantity for Product ${productId} on order: ${err}`
      )
    }
  }

  async submitCurrentOrder(userId: number): Promise<Order> {
    try {
      const currentOrder = await this.getActiveOrderForUser(userId)

      const conn = await client.connect()
      const sql = 'UPDATE orders SET status=($1) WHERE id=($2) RETURNING *'

      await conn.query(sql, ['complete', currentOrder.id])

      conn.release()

      const result = await getOrdersForUser(userId, 'complete', currentOrder.id)

      return result[0]
    } catch (err) {
      throw new Error(`Unable to complete current Order: ${err}`)
    }
  }
}
