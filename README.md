# Udacity-StorefrontBackend

This project was created as part of the Udacity Full Stack JavaScript Developer Nanodegree. The intent was to create a Storefront Backend that would provide a backend to allow a front-end developer to connect to. The backend would provide the ability to manage a cart, order products, register, sign-in, etc.

See the [requirements doc](REQUIREMENTS.md) for more information.

## Prereqs

- Node
  - I built and tested with v17.7.1
- Docker and Docker Compose
  - I built and tested with v20.10.20

## Setup

1. Clone the repository to your local machine.
2. Run `npm install` to install the necessary packages.
3. Copy the `.env.sample` file to one called `.env` and fill in the blanks.
4. Run the docker-compose YAML file with your docker tool of choice.
5. Run `npm run migrate` to build the needed database tables.
6. Run `npm start` to build the code and start the server.

## Scripts

- Build and run the project with `npm start`.
- Stand up database tables in a connected Postgres DB with `npm run migrate`.
- Run tests with `npm test`.
- Compile TypeScript with `npm run build`.
- Lint with `npm run eslint`.
- Format with `npm run prettier`.
- Start the server in watch mode with `npm run watch`. This will start the server with [tsc-watch](https://github.com/gilamran/tsc-watch), so that saving changes to any files will restart the server with the new changes included.

## Packages Used

- [Express](https://expressjs.com/)
- [body-parser](https://github.com/expressjs/body-parser)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [pg](https://node-postgres.com/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [db-migrate](https://db-migrate.readthedocs.io/en/latest/)
- [TypeScript](https://www.typescriptlang.org/)
- [tsc-watch](https://github.com/gilamran/tsc-watch)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Jasmine](https://jasmine.github.io/)
