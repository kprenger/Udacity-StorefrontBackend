import client from '../database'

export type Product = {
  id?: number
  name: string
  price: number
  category: string
}

export class ProductStore {
  async index(category?: string): Promise<Product[]> {
    try {
      const conn = await client.connect()

      let sql = 'SELECT * FROM products'
      const params: Array<string | number> = []

      if (category) {
        sql += ' WHERE category=($1)'
        params.push(category)
      }

      const result = await conn.query(sql, params)

      conn.release()

      return result.rows
    } catch (err) {
      throw new Error(`Error getting products: ${err}`)
    }
  }

  async show(id: number): Promise<Product> {
    try {
      const conn = await client.connect()

      const sql = 'SELECT * FROM products WHERE id=($1)'
      const result = await conn.query(sql, [id])

      conn.release()

      return result.rows[0]
    } catch (err) {
      throw new Error(`Error getting product ${id}: ${err}`)
    }
  }

  async create(product: Product): Promise<Product> {
    try {
      const conn = await client.connect()

      const sql =
        'INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *'
      const result = await conn.query(sql, [
        product.name,
        product.price,
        product.category
      ])

      conn.release()

      return result.rows[0]
    } catch (err) {
      throw new Error(`Error creating product ${product}: ${err}`)
    }
  }

  async getProductCategories(): Promise<string[]> {
    try {
      const conn = await client.connect()

      const sql = 'SELECT DISTINCT category FROM products ORDER BY category'
      const result = await conn.query(sql)

      return result.rows.map((item) => item.category)
    } catch (err) {
      throw new Error(`Error getting categories: ${err}`)
    }
  }

  async getPopularProducts(
    limit?: number,
    category?: string
  ): Promise<Product[]> {
    // TODO: Finish this route
    console.log(`${limit}: ${category}`)
    return []
  }
}
