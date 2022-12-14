# API Requirements

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application.

## API Endpoints

### Products

Product JSON representation

```
{
  "id": 5,
  "name": "Apple",
  "price": "0.69",
  "category": "food"
}
```

- Show All Products (Index)
  - `GET /api/products?category=:category`
  - The `category` parameter is optional and can be used to filter the result to a specific category.
- Show Specific Product
  - `GET /api/products/:id`
- Create Product
  - `POST /api/products`
  - **Valid JWT required**
  - The JSON body is a representation of a Product as above without the `id` field.
- Show Popular products
  - `GET /api/products/popular?limit=:limit&category=:category`
  - "Popular" equates to highest quantity sold.
  - The `limit` parameter is optional. If specified, will return the top # of given products. Otherwise, defaults to 5.
  - The `category` parameter is optional to filter the result to a specific product category.
- Show available categories
  - `GET /api/products/categories`

### Users

User JSON representation

```
{
  "id": 1,
  "firstName": "Jack",
  "lastName": "Jackson",
  "username": "jjackson"
}
```

- Show All Users (Index)
  - `GET /api/users`
  - **Valid JWT required**
- Show Specific User
  - `GET /api/users/:id`
  - **Valid JWT required**
- Create User
  - `POST /api/users`
  - **Valid JWT required**
  - The JSON body is a representation of a User as above without the `id` field.
- Register
  - `POST /api/users/register`
  - The JSON body is a representation of a User as above without the `id` field.
- Login
  - `POST /api/users/authenticate`
  - The JSON body is a username / password pairing. `{ "username": "jjackson", "password": "Password123" }`

### Orders

Order JSON representation

```
{
  "id": 2,
  "status": "complete",
  "userId": 1,
  "products": [
    {
      "product": {
        "id": 5,
        "name": "Apple",
        "price": "0.69",
        "category": "food"
      },
      "quantity": 12
    },
    {
      "product": {
        "id": 4,
        "name": "Cell phone",
        "price": "499.99",
        "category": "electronics"
      },
      "quantity": 1
    },
    {
      "product": {
        "id": 3,
        "name": "Computer",
        "price": "749.99",
        "category": "electronics"
      },
      "quantity": 2
    }
  ]
}
```

- Current Order by user
  - `GET /api/users/:id/orders/current`
  - **Valid JWT required**
  - **Cannot request for other users**
  - The current order should be the only 'active' order.
- Completed Orders by user
  - `GET /api/users/:id/orders/completed`
  - **Valid JWT required**
  - **Cannot request for other users**
- Add Product to Order
  - `POST /api/users/:id/orders/add`
  - **Valid JWT required**
  - **Cannot request for other users**
  - The JSON body is a of Product ID and Quantity. `{ "productId": 1, "quantity": 2 }`
  - Adds the given Product to the current order.
- Submit Current Order
  - `POST /api/users/:id/orders/submit`
  - **Valid JWT required**
  - **Cannot request for other users**

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

| Column  | Data Type                   | Description                                            |
| ------- | --------------------------- | ------------------------------------------------------ |
| id      | SERIAL PRIMARY KEY          | The Order ID                                           |
| status  | VARCHAR 20                  | The status of the Order. Either `active` or `complete` |
| user_id | BIGINT REFERENCES users(id) | The Foreign key to the User table                      |

### Order Products

| Column     | Data Type                      | Description                          |
| ---------- | ------------------------------ | ------------------------------------ |
| id         | SERIAL PRIMARY KEY             | The Order Products ID                |
| quantity   | INTEGER                        | The amount of Products ordered       |
| product_id | BIGINT REFERENCES products(id) | The Foreign key to the Product table |
