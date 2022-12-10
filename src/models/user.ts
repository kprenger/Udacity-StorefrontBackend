import client from '../database'

export type User = {
  id?: number
  firstName: string
  lastName: string
  username: string
}

type DBUser = {
  id: number
  first_name: string
  last_name: string
  username: string
  password_digest: string
}

function parseDBUser(user: DBUser): User {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username
  }
}

export class UserStore {
  async index(): Promise<User[]> {
    try {
      const conn = await client.connect()

      const sql = 'SELECT * FROM users'
      const result = await conn.query(sql)

      conn.release()

      return result.rows.map(parseDBUser)
    } catch (err) {
      throw new Error(`Error getting users: ${err}`)
    }
  }
}
