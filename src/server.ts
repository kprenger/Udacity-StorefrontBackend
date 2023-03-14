import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import usersRoutes from './handlers/users'
import productsRoutes from './handlers/products'
import ordersRoutes from './handlers/orders'

const app: express.Application = express()
const address = '0.0.0.0:3000'

app.use(bodyParser.json())
app.use(cors())

usersRoutes(app)
productsRoutes(app)
ordersRoutes(app)

app.all('*', function (req: Request, res: Response) {
  res.send(
    'The server is running. Please refer to documentation on what routes are available.'
  )
})

app.listen(3000, function () {
  console.log(`starting app on: ${address}`)
})
