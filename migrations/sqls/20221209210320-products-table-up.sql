CREATE TABLE
  products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price NUMERIC(20, 2),
    category VARCHAR(100),
    url VARCHAR(1000),
    description TEXT
  );
