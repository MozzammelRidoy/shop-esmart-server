# Backend Overview (Shop esmart)

The backend of **Shop esmart** is powered by Node.js and Express.js, with MongoDB as the database to handle the storage and management of data. It is designed with a RESTful architecture, ensuring modular, scalable, and efficient API endpoints for seamless interaction between the client and server. The backend supports essential features such as product management, user authentication, order processing, and role-based access control.

## Key Features

### 1. **RESTful API Development**
- The backend is structured with RESTful principles, ensuring clean and predictable API endpoints.
- **CRUD operations** for products, users, and orders are implemented to provide full functionality for e-commerce workflows.
- **Middleware** is used for authentication, logging, and error handling to improve the API's efficiency and security.

### 2. **Authentication & Authorization**
- **JWT (JSON Web Tokens)** are used for secure authentication. Each token is assigned to a user upon login, ensuring that protected routes are only accessible by authenticated users.
- **Role-based access control (RBAC)** is implemented, providing different levels of access (Admin, Manager, Moderator) to specific resources and routes.
- **Google reCAPTCHA** integration for added security to prevent bot attacks.

### 3. **Product Management**
- Admin users can **add, update, and delete products** using the API.
- Products are categorized dynamically, and users can filter them based on categories, price ranges, and other parameters.
- **Cloudinary** is used for image upload and management, with a **Drag & Drop** feature for smooth user experience.

### 4. **Order Processing**
- **Order statuses** include Pending, Confirmed, Processing, Delivered, Canceled, and Returned. Admin users have the capability to update orders based on their current status.
- **Revenue and profit tracking** is incorporated, allowing admins to view total revenue, product-specific profits, and coupon discounts.
- Orders are **tracked through various stages**, from user submission to final delivery, with real-time updates on the dashboard.

### 5. **Transaction & Payment Management**
- **SSLCommerz** is integrated for secure and seamless payment processing.
- The backend validates payment statuses and logs all transactions to provide accurate order and payment details.
- Admin users can manage and validate coupon codes via the **Coupons API**.

### 6. **User Management**
- Admins can manage both regular users and other admin roles (Manager, Moderator).
- The backend supports **banning/unbanning users** and **updating roles** dynamically.
- **Profile management** includes viewing and editing user details, order history, and favorite items.

### 7. **Search & Filtering**
- Comprehensive search functionality allows for searching by product name, user details, order history, and transaction records.
- Products can be **filtered by price**, **category**, and other custom attributes via API queries.

### 8. **Security**
- **CORS** (Cross-Origin Resource Sharing) is enabled to allow communication between the client and server from different origins.
- **Helmet.js** is used to set up security headers to protect against common web vulnerabilities.
- **Rate limiting** is implemented to prevent brute force attacks, particularly on login and payment routes.

## Technologies Used

- **Node.js**: JavaScript runtime environment that enables the execution of server-side code.
- **Express.js**: Fast, unopinionated web framework for Node.js used to create the RESTful API.
- **MongoDB**: NoSQL database for storing application data, such as users, products, and orders.
- **JWT (JSON Web Tokens)**: For secure authentication and session management.
- **Multer**: Middleware for handling multipart form data, especially for file uploads.
- **Cloudinary**: Image hosting and management solution used for product images.
- **Bcrypt.js**: Library used to hash passwords for secure user authentication.
- **SSLCommerz**: Payment gateway integration for handling e-commerce transactions.
- **Google reCAPTCHA**: Protects forms and authentication endpoints from spam and abuse.
- **Socket.io (Future Plan)**: Planned for real-time chat feature integration.

## Backend Routes

### Authentication Routes
- `POST /auth/login`: Login endpoint for users.
- `POST /auth/register`: Registration endpoint for new users.
- `POST /auth/forgot-password`: Reset password functionality.

### Product Management Routes
- `GET /products`: Fetch all products with optional filters.
- `POST /products`: Add a new product (Admin only).
- `PUT /products/:id`: Update an existing product (Admin only).
- `DELETE /products/:id`: Delete a product (Admin only).

### Order Management Routes
- `GET /orders`: Fetch all orders (Admin only).
- `POST /orders`: Create a new order.
- `PUT /orders/:id`: Update an order status.
- `DELETE /orders/:id`: Cancel or delete an order.

### Payment & Transactions Routes
- `POST /payment/sslcommerz`: Process payment using SSLCommerz.
- `GET /transactions`: Fetch all transactions (Admin only).

### Coupon Management Routes
- `POST /coupons`: Create a new coupon code (Admin only).
- `GET /coupons`: Fetch all active coupons.
- `PUT /coupons/:id`: Update coupon details (Admin only).
- `DELETE /coupons/:id`: Delete a coupon code (Admin only).

### User Management Routes
- `GET /users`: Fetch all users (Admin only).
- `PUT /users/:id`: Update user role or ban/unban user (Admin only).
- `DELETE /users/:id`: Delete a user (Admin only).

## Future Plans

- **Real-time Chat with Socket.io**: Enable live chat between users and customer support.
- **User Behavior Analytics**: Implement tracking of user actions (e.g., views, searches) to deliver personalized product recommendations.
- **Enhanced Dashboard Reports**: Provide more insights into sales trends, product performance, and user behavior with graphical reports and data visualizations.

## Links to Deployment and Code

- **Client-Side GitHub Repository**: [GitHub - Shop esmart Client](https://github.com/MozzammelRidoy/shop-esmart-client)
- **Server-Side GitHub Repository**: [GitHub - Shop esmart Server](https://github.com/MozzammelRidoy/shop-esmart-server)
- **Live Link (Hosted on Vercel)**: [Shop esmart](https://shop-esmart-server.vercel.app/)

## Environment Variables

Ensure the following environment variables are set up in your `.env` file:

```bash
JWT_SECRET=
MONGO_URI=
SSL_PAYMENT_KEY=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=
