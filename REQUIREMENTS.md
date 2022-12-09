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
  - **Valid JWT required**
  - The JSON body is a representation of a User.

### Orders

- Current Order by user
  - `GET /api/users/:id/orders/current`
  - **Valid JWT required**

**Optional**

- Completed Orders by user
  - `GET /api/users/:id/orders/completed`
  - **Valid JWT required**

## Data Shapes

### Product

- id (INTEGER)
- name (VARCHAR 200)
- price (NUMERIC(20, 2))
- category (VARCHAR 100)

### User

- id (INTEGER)
- first_name (VARCHAR 200)
- last_name (VARCHAR 200)
- username (VARCHAR 200)
- password (VARCHAR 200)

### Orders

- id (INTEGER)
- product_id (INTEGER - Foreign Key to Product)
- quantity (INTEGER)
- user_id (INTEGER - Foreign Key to User)
- status (VARCHAR 20)
  - Either `active` or `complete`
