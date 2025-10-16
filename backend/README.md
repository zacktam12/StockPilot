# StockPilot Backend API

<div align="center">

**Enterprise-grade RESTful API for inventory management**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.1-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-v6.13-success.svg)](https://www.prisma.io/)

</div>

---

## 📋 Overview

The StockPilot backend is a robust Node.js/Express API that provides comprehensive inventory management capabilities. Built with a layered architecture pattern, it ensures maintainability, scalability, and security.

## ✨ Key Features

- **RESTful API Design**: Clean, intuitive API endpoints following REST principles
- **Layered Architecture**: Separation of concerns with Controllers, Services, and Repositories
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions for Admin, Manager, and Staff roles
- **Data Validation**: Request validation using Joi schemas
- **Database ORM**: Prisma for type-safe database operations
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Error Handling**: Comprehensive error handling and logging
- **File Uploads**: Support for product images and company logos
- **Email Notifications**: Automated email alerts using Nodemailer
- **Logging**: Structured logging with Winston
- **Database Migrations**: Version-controlled database schema changes

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime Environment |
| **Express** | 5.1.0 | Web Framework |
| **Prisma** | 6.13.0 | Database ORM |
| **PostgreSQL** | Latest | Database |
| **JWT** | 9.0.2 | Authentication |
| **Bcrypt** | 6.0.0 | Password Hashing |
| **Joi** | 17.13.3 | Validation |
| **Winston** | 3.17.0 | Logging |
| **Swagger** | Latest | API Documentation |
| **Multer** | 2.0.1 | File Upload |
| **Nodemailer** | 6.10.1 | Email Service |
| **Redis** | 5.8.2 | Caching |

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- PostgreSQL v14 or higher
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/stockpilot"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRE="7d"
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Email (Optional)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-app-password"
   
   # Redis (Optional)
   REDIS_URL="redis://localhost:6379"
   
   # File Upload
   MAX_FILE_SIZE=5242880
   UPLOAD_DIR="uploads"
   
   # CORS
   CORS_ORIGIN="http://localhost:5173"
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate deploy
   
   # Seed database (optional)
   npx prisma db seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.js                # Database seeder
│   └── migrations/            # Database migrations
├── src/
│   ├── app.js                 # Express app setup
│   ├── server.js              # Server entry point
│   ├── config/                # Configuration
│   │   ├── db.js
│   │   ├── jwt.js
│   │   └── token.js
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── sale.controller.js
│   │   ├── purchase.controller.js
│   │   ├── customer.controller.js
│   │   ├── supplier.controller.js
│   │   ├── user.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── reports.controller.js
│   │   ├── category.controller.js
│   │   ├── settings.controller.js
│   │   └── notification.controller.js
│   ├── services/              # Business logic
│   ├── repositories/          # Data access layer
│   ├── routes/                # API routes
│   ├── middlewares/           # Express middlewares
│   ├── validators/            # Request validation
│   ├── utils/                 # Utilities
│   └── docs/                  # API documentation
├── uploads/                   # File uploads
├── logs/                      # Application logs
└── package.json
```

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│              Routes Layer                    │  ← API Endpoints
├─────────────────────────────────────────────┤
│            Middleware Layer                  │  ← Auth, Validation, Rate Limiting
├─────────────────────────────────────────────┤
│           Controllers Layer                  │  ← Request/Response Handling
├─────────────────────────────────────────────┤
│            Services Layer                    │  ← Business Logic
├─────────────────────────────────────────────┤
│          Repositories Layer                  │  ← Data Access
├─────────────────────────────────────────────┤
│         Database Layer (Prisma)              │  ← ORM
└─────────────────────────────────────────────┘
```

### Request Flow

```
Client Request
    ↓
Route Handler
    ↓
Middleware (Auth, Validation)
    ↓
Controller (Request Handling)
    ↓
Service (Business Logic)
    ↓
Repository (Database Operations)
    ↓
Database
    ↓
Response
```

## 📚 API Documentation

### Swagger UI

Access the interactive API documentation:

```
http://localhost:5000/api-docs
```

### Authentication

All protected endpoints require a JWT token:

```bash
Authorization: Bearer <jwt-token>
```

### Example Request

```bash
curl -X GET "http://localhost:5000/api/products" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json"
```

## 🔐 Authentication & Security

### JWT Authentication

- Tokens expire after 7 days (configurable)
- Refresh token support
- Secure password hashing with bcrypt (10 rounds)

### Account Lockout

- Maximum 5 failed login attempts
- 15-minute lockout period
- Automatic unlock after timeout

### Rate Limiting

- 100 requests per 15 minutes per IP
- Customizable per route

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## 🗄️ Database Schema

### Main Tables

- **User**: User accounts and authentication
- **Role**: User roles and permissions
- **Product**: Product catalog
- **Category**: Product categories
- **Sale**: Sales transactions
- **SaleItem**: Sale line items
- **Purchase**: Purchase orders
- **PurchaseItem**: Purchase line items
- **Customer**: Customer database
- **Supplier**: Supplier directory
- **Notification**: User notifications
- **Settings**: System settings

### Relationships

```
User ──┬── Role
       ├── Sales (as Seller)
       ├── Purchases (as Buyer)
       └── Notifications

Product ──┬── Category
          ├── SaleItems
          ├── PurchaseItems
          └── Supplier

Sale ──┬── User (Seller)
       ├── Customer
       └── SaleItems

Purchase ──┬── User (Buyer)
           ├── Supplier
           └── PurchaseItems
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT | Required |
| `JWT_EXPIRE` | Token expiration time | 7d |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `CORS_ORIGIN` | Allowed CORS origins | * |
| `MAX_FILE_SIZE` | Max upload size in bytes | 5242880 |
| `UPLOAD_DIR` | Upload directory | uploads |

### Database Configuration

Edit `prisma/schema.prisma` for schema changes:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 📝 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products

- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/bulk-import` - Bulk import

### Sales

- `GET /api/sales` - List sales
- `GET /api/sales/:id` - Get sale
- `POST /api/sales` - Create sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Purchases

- `GET /api/purchases` - List purchases
- `GET /api/purchases/:id` - Get purchase
- `POST /api/purchases` - Create purchase
- `PUT /api/purchases/:id` - Update purchase
- `DELETE /api/purchases/:id` - Delete purchase

### Dashboard

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/recent-sales` - Recent sales
- `GET /api/dashboard/top-products` - Top products
- `GET /api/dashboard/low-stock` - Low stock alerts

See [Swagger documentation](http://localhost:5000/api-docs) for complete API reference.

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

## 📊 Logging

### Log Levels

- **error**: Error messages
- **warn**: Warning messages
- **info**: Informational messages
- **debug**: Debug messages

### Log Files

- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

### Example

```javascript
const logger = require('./utils/logger');

logger.info('Product created', { productId: product.id });
logger.error('Database error', { error: err.message });
```

## 🚀 Deployment

### Production Build

```bash
# Install production dependencies
npm install --production

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start server
npm start
```

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name stockpilot-api

# Monitor
pm2 monit

# Logs
pm2 logs stockpilot-api
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
```

## 🔍 Database Migrations

### Create Migration

```bash
npx prisma migrate dev --name add_new_field
```

### Apply Migrations

```bash
npx prisma migrate deploy
```

### Reset Database

```bash
npx prisma migrate reset
```

### Seed Database

```bash
npx prisma db seed
```

## 🛡️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "field": "validation error"
  }
}
```

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## 📈 Performance

### Optimization Techniques

- Database indexing on frequently queried fields
- Connection pooling with Prisma
- Redis caching for frequently accessed data
- Pagination for large datasets
- Query optimization with Prisma includes
- Compression middleware

## 👨‍💻 Author

**Zekarias Tamiru**

- GitHub: [@zacktam12](https://github.com/zacktam12)
- LinkedIn: [Zekarias Tamiru](https://www.linkedin.com/in/zekariastamiru)
- Email: stockpilotsales@gmail.com

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/zacktam12/StockPilot/issues)
- **Documentation**: [Swagger Docs](http://localhost:5000/api-docs)
- **Wiki**: [GitHub Wiki](https://github.com/zacktam12/StockPilot/wiki)

---

<div align="center">

**Built with ❤️ using Node.js and Express**

</div>

