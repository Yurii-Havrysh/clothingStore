# Sports Clothing Store API Documentation
## Description
The Sports Clothing Store API allows users to search for specific sports clothing items by size, color and other parameters. Users can view available products matching their search criteria.

## Access of API: 
```
http://localhost:3000
```

## Technical Requirements
- Backend: Node.js 
- Framework - Express
- Database: MongoDB
- Frontend: HTML, CSS (basic design with a list of sports clothes using jquery)
## API Endpoints
### GET /api/products
- Request: `GET /api/products` 
- Here we get a list of all available sports clothing products.
- Response:
```
[
  {
    "id": 1,
    "name": "Men's Hoodie",
    "price": 20
  },
  {
    "id": 2,
    ...
  },
  ...
]
```
### GET /api/products/search
- Request: `GET /api/products/search` - Here we search for sports clothing products based on size and color.
- Parameters:
  - size (string, required) - The size of the sports clothing item.
  - color (string, optional) - The color of the sports clothing item.
- Response:
```
[
  {
    "id": 1,
    "name": "Sports T-shirt",
    "size": "M",
    "color": "Red",
    "price": 29.99
  },
  ...
]
```
### POST /api/products
- Request: `POST /api/products` - Here we create a new sports clothing product.
- Request Body:
```
{
  "name": "New Product",
  "price": 39.99
}
```
- Response:
Success:
```
{
  "id": 3,
  "name": "New Product",
  "price": 39.99
}
```
Error:
```
{
  "error": "Invalid product data. Please provide name, size, color, and price."
}
```
### PUT /api/products/:id
- Request: `PUT /api/products/:id` - Updating an existing sports clothing product.
- Parameters:
id (string, required) - The ID of the product to update.
- Request Body:
```
{
  "name": "Updated Product",
  "price": 49.99
}
```
- Response:
Success:
```
{
  "message": "Product with ID 3 has been updated successfully."
}
```
Error:
```
{
  "error": "Product not found."
}
```
### DELETE /api/delete-product/:id
- Request: `DELETE /api/products/:id` - Deleting a sports clothing product by ID.
- Parameters:
  - id (string, required) - The ID of the product to delete.
- Response:
Success:
```
{
  "message": "Product with ID 3 has been deleted successfully."
}
```
Error:
```
{
  "error": "Product not found."
}
```
Users
### GET /api/users
- Request: `GET /api/users` - Retrieve a list of all users.
- Response:
```
[
  {
    "id": 1,
    "name": User1,
    "username": "user1",
    "email": "user1@example.com",
    "admin": 0
  },
  {
    "id": 2,
    "name": User2,
    "username": "user2",
    "email": "user2@example.com",
    "admin": 0
  },
  ...
]
```

### GET /api/users/register
Request: GET /api/users/register

Parameters:
email (string, required) - The email of user
username (string, required) - The username of the user.
Response:
```
{
  "id": 1,
  "username": "user1",
  "email": "user1@example.com"
}
```
### Registration POST /api/users/register
Request: POST /api/users/register
Register a new user.
Request Body:
```
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123"
}
```
Response:
- Success:
```
{
  "name": "Newuser",
  "username": "newuser",
  "email": "newuser@example.com",
}
{
  message: "You are now registered!"
}
```
- Error:
```
{
  "error": "Error occurred while registering user."
}
```
### Authentication
- Request: POST /api/users/login
Authenticate a user.
- Request Body:
```
{
  "username": "existinguser",
  "password": "password123"
}
```
Response:
Success:
```
{
  "name": Existinguser,
  "username": "existinguser",
  "email": "existinguser@example.com",
  "token": "jwt-token"
}
```
Error:
```
{
  "error": "Invalid username or password."
}
```

### Orders
- Request: GET /api/cart/checkout - Retrieve a list of all orders.
- Response:
```
[
  {
    "name": User1,
    "username": user1,
    "products": [
      {
        "productId": 1,
        "quantity": 2
      },
      {
        "productId": 2,
        "quantity": 1
      }
    ],
    "totalPrice": 99.99,
  },
...
]
```

### Installation and Run
- Clone the Repository:
```
git clone [repository-https://github.com/Yurii-Havrysh/clothingStore]
```
Navigate to Project Folder:
```
cd sports-clothing-store
```
Install Dependencies:
```
npm install
```
Start the Server:
```
npm start
```
