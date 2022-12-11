# API Requirements

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application.

## API Endpoints

### Products

- Show All Products (Index)
  - `GET /api/products?category=:category&top=:number`
  - The `category` parameter is optional and will default to showing all products.
  - The `top` parameter is optional. If specified, will return the top # of given products.
- Show Specific Product
  - `GET /api/products/:id`
- Create Product
  - `POST /api/products`
  - **Valid JWT required**
  - The JSON body is a representation of a Product.

**Optional**

- Top 5 most popular products
  - See "Show All Products" above
- Available categories
  - `GET /api/products/categories`
- Products by category
  - See "Show All Products" above

### Users

- Show All Users (Index)
  - `GET /api/users`
  - **Valid JWT required**
- Show Specific User
  - `GET /api/users/:id`
  - **Valid JWT required**
- Create User
  - `POST /api/users`
  - The JSON body is a representation of a User.
- Login
  - `POST /api/authenticate`
  - The JSON body is a username / password pairing.

### Orders

- Current Order by user
  - `GET /api/users/:id/orders/current`
  - **Valid JWT required**

**Optional**

- Completed Orders by user
  - `GET /api/users/:id/orders/completed`
  - **Valid JWT required**
- Add Products to Order
  - `POST /api/users/:id/orders/add`
  - **Valid JWT required**
  - The JSON body is an array of Products.

## Data Shapes

### Product

| Column   | Data Type          | Description                 |
| -------- | ------------------ | --------------------------- |
| id       | SERIAL PRIMARY KEY | The Product ID              |
| name     | VARCHAR 100        | The name of the Product     |
| price    | NUMERIC 20, 2      | The price of the Product    |
| category | VARCHAR 100        | The category of the Product |

### User

| Column          | Data Type          | Description                   |
| --------------- | ------------------ | ----------------------------- |
| id              | SERIAL PRIMARY KEY | The User ID                   |
| first_name      | VARCHAR 100        | The User's first name         |
| last_name       | VARCHAR 100        | The User's last name          |
| username        | VARCHAR 100        | The username for the User     |
| password_digest | VARCHAR            | The User's encrypted password |

### Orders

| Column     | Data Type                      | Description                                            |
| ---------- | ------------------------------ | ------------------------------------------------------ |
| id         | SERIAL PRIMARY KEY             | The Order ID                                           |
| quantity   | INTEGER                        | The amount of Products ordered                         |
| status     | VARCHAR 20                     | The status of the Order. Either `active` or `complete` |
| product_id | BIGINT REFERENCES products(id) | The Foreign key to the Product table                   |
| user_id    | BIGINT REFERENCES users(id)    | The Foreign key to the User table                      |
