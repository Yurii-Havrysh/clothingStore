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
- Frontend: HTML, CSS (basic design with a list of sports clothes and filters)
## API Endpoints
### GET /api/products
- Request: `GET /api/products` 
- Here we get a list of all available sports clothing products.
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
  "size": "L",
  "color": "Blue",
  "price": 39.99
}
```
- Response:
Success:
```
{
  "id": 3,
  "name": "New Product",
  "size": "L",
  "color": "Blue",
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
  "size": "M",
  "color": "Green",
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
### DELETE /api/products/:id
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
