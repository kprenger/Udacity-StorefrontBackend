import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const {
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_TEST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  ENV
} = process.env

let client: Pool

if (ENV === 'test') {
  client = new Pool({
    host: POSTGRES_HOST,
    database: POSTGRES_TEST,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD
  })
} else if (ENV === 'dev') {
  client = new Pool({
    host: POSTGRES_HOST,
    database: POSTGRES_DB,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD
  })
} else {
  client = new Pool()
}

export default client
