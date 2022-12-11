import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'

import usersRoutes from './handlers/users'

const app: express.Application = express()
const address = '0.0.0.0:3000'

app.use(bodyParser.json())

usersRoutes(app)

app.all('*', function (req: Request, res: Response) {
  res.send(
    'The server is running. Please refer to documentation on what routes are available.'
  )
})

app.listen(3000, function () {
  console.log(`starting app on: ${address}`)
})
