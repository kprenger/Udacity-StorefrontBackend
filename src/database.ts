import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const {
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  APP_ENV
} = process.env

const defaultPort = '5432'
const defaultTestPort = '5434'

let client: Pool

if (APP_ENV === 'test') {
  client = new Pool({
    host: POSTGRES_HOST,
    database: POSTGRES_DB,
    port: parseInt(POSTGRES_PORT ?? defaultTestPort),
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD
  })
} else if (APP_ENV === 'dev') {
  client = new Pool({
    host: POSTGRES_HOST,
    database: POSTGRES_DB,
    port: parseInt(POSTGRES_PORT ?? defaultPort),
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD
  })
} else {
  client = new Pool()
}

export default client
