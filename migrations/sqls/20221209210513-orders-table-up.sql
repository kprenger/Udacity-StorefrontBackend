CREATE TABLE
  orders (
    id SERIAL PRIMARY KEY,
    quantity INTEGER,
    status VARCHAR(20),
    product_id BIGINT REFERENCES products(id),
    user_id BIGINT REFERENCES users(id)
  );
