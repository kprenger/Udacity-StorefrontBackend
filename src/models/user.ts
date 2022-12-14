import bcrypt from 'bcrypt'

import client from '../database'

export type User = {
  id?: number
  firstName: string
  lastName: string
  username: string
  password?: string
}

type DBUser = {
  id: number
  first_name: string
  last_name: string
  username: string
  password_digest: string
}

const { SALT_ROUNDS, BCRYPT_PASSWORD } = process.env
const defaultSalt = '10'

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

  async show(id: number): Promise<User | undefined> {
    try {
      const conn = await client.connect()

      const sql = 'SELECT * FROM users WHERE id=($1)'
      const result = await conn.query(sql, [id])

      conn.release()

      if (result.rows.length === 0) {
        return
      }

      return parseDBUser(result.rows[0])
    } catch (err) {
      throw new Error(`Error getting user ${id}: ${err}`)
    }
  }

  async create(user: User): Promise<User> {
    if (!user.password) {
      throw new Error('A password must be specified to create a new user.')
    }

    try {
      const conn = await client.connect()
      const sql =
        'INSERT INTO users(first_name, last_name, username, password_digest) VALUES ($1, $2, $3, $4) RETURNING *'

      const hash = await bcrypt.hash(
        user.password + BCRYPT_PASSWORD,
        parseInt(SALT_ROUNDS ?? defaultSalt)
      )

      const result = await conn.query(sql, [
        user.firstName,
        user.lastName,
        user.username,
        hash
      ])

      conn.release()

      return parseDBUser(result.rows[0])
    } catch (err) {
      throw new Error(`Error creating user ${user}: ${err}`)
    }
  }

  async authenticate(
    username: string,
    password: string
  ): Promise<User | undefined> {
    try {
      const conn = await client.connect()

      const sql = 'SELECT * FROM users WHERE username=($1)'
      const result = await conn.query(sql, [username])

      conn.release()

      if (result.rows.length > 0) {
        const dbUser = result.rows[0] as DBUser

        if (
          await bcrypt.compare(
            password + BCRYPT_PASSWORD,
            dbUser.password_digest
          )
        ) {
          return parseDBUser(dbUser)
        }
      }

      return
    } catch (err) {
      throw new Error(`Error authenticating for ${username}: ${err}`)
    }
  }
}
