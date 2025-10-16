# 📦 StockPilot - Comprehensive Inventory Management System

<div align="center">

![StockPilot Logo](stockLandingPage/public/logo.png)

**A modern, full-featured inventory management system built with React, Node.js, and PostgreSQL**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue.svg)](https://www.typescriptlang.org/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Contact](#-contact)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [API Documentation](#-api-documentation)
- [Features Deep Dive](#-features-deep-dive)
- [Deployment](#-deployment)
- [Author](#-author)

---

## 🌟 Overview

**StockPilot** is a comprehensive, enterprise-grade inventory management system designed to streamline business operations for retailers, wholesalers, and manufacturers. The system provides real-time inventory tracking, sales management, purchase order processing, customer relationship management, and powerful analytics—all in one unified platform.

### Why StockPilot?

- **Complete Business Solution**: Manage products, sales, purchases, customers, and suppliers in one place
- **Real-time Analytics**: Get instant insights into your business performance with interactive dashboards
- **Multi-user Support**: Role-based access control for different user types (Admin, Manager, Staff)
- **Modern UI/UX**: Beautiful, responsive interface built with the latest web technologies
- **Scalable Architecture**: Built to handle growing businesses with efficient database design
- **API-First Design**: RESTful API with comprehensive Swagger documentation

---

## ✨ Features

### 📊 Dashboard & Analytics
- **Real-time Business Metrics**: Track sales, purchases, revenue, and profit in real-time
- **Interactive Charts**: Visualize trends with Chart.js and Recharts
- **Low Stock Alerts**: Automatic notifications for products below reorder level
- **Performance Reports**: Comprehensive sales and purchase reports with date range filtering
- **Top Products Analysis**: Identify best-selling and slow-moving inventory

### 🛍️ Sales Management
- **Point of Sale (POS)**: Fast and intuitive sales interface
- **Invoice Generation**: Automatic invoice creation with PDF export
- **Payment Tracking**: Multiple payment methods support
- **Sales History**: Complete transaction history with search and filters
- **Customer Assignment**: Link sales to customer accounts for better CRM

### 📦 Inventory Management
- **Product Catalog**: Comprehensive product management with categories
- **Stock Tracking**: Real-time inventory levels across all locations
- **Barcode Support**: Quick product lookup and scanning
- **Bulk Operations**: Import/export products via CSV
- **Image Management**: Upload and manage product images
- **Product Variants**: Support for different sizes, colors, and variants
- **Reorder Alerts**: Automatic low-stock notifications

### 🛒 Purchase Management
- **Purchase Orders**: Create and track purchase orders
- **Supplier Management**: Maintain supplier database with contact information
- **Cost Tracking**: Monitor purchase costs and profit margins
- **Purchase History**: Complete record of all purchases
- **Supplier Performance**: Track supplier reliability and pricing

### 👥 Customer & Supplier Management
- **Customer Database**: Store customer information and purchase history
- **Supplier Directory**: Manage supplier contacts and terms
- **Credit Management**: Track customer credit limits and balances
- **Contact History**: Maintain communication logs
- **Loyalty Programs**: Support for customer loyalty and rewards

### 📈 Reports & Analytics
- **Sales Reports**: Daily, weekly, monthly, and custom date range reports
- **Purchase Reports**: Analyze purchase patterns and costs
- **Profit Analysis**: Calculate and track profit margins
- **Inventory Reports**: Stock levels, movement, and valuation
- **Export Options**: PDF and Excel export for all reports

### 🔐 User Management & Security
- **Role-Based Access Control (RBAC)**: Admin, Manager, and Staff roles
- **User Permissions**: Granular control over feature access
- **Authentication**: Secure JWT-based authentication
- **Password Management**: Secure password hashing with bcrypt
- **Account Lockout**: Protection against brute force attacks
- **Activity Logging**: Track user actions and system events

### 🎨 User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: User-preferred theme with system detection
- **Modern UI Components**: Built with Ant Design and custom components
- **Real-time Notifications**: Toast notifications and notification center
- **Keyboard Shortcuts**: Power user features for faster operations
- **Print Support**: Print-optimized layouts for invoices and reports

### 🔔 Notifications
- **Real-time Alerts**: WebSocket-based instant notifications
- **Email Notifications**: Automated email alerts for important events
- **Low Stock Warnings**: Automatic alerts when inventory runs low
- **User Mentions**: Notify users when mentioned in notes or comments

### ⚙️ Settings & Customization
- **Business Profile**: Configure company information and branding
- **Logo Upload**: Custom logo for invoices and reports
- **Currency Settings**: Multi-currency support
- **Tax Configuration**: Flexible tax rate settings
- **Receipt Customization**: Customize invoice and receipt templates

---

## 🛠️ Tech Stack

### Frontend (React SPA)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.0 | UI Library |
| **Redux Toolkit** | 2.8.2 | State Management |
| **React Router** | 7.6.2 | Client-side Routing |
| **Vite** | 6.3.5 | Build Tool & Dev Server |
| **Ant Design** | 5.27.4 | UI Component Library |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS Framework |
| **Chart.js** | 4.4.9 | Data Visualization |
| **Recharts** | 2.15.4 | React Chart Library |
| **Axios** | 1.9.0 | HTTP Client |
| **React Query** | 5.80.2 | Data Fetching & Caching |
| **jsPDF** | 3.0.1 | PDF Generation |
| **ExcelJS** | 4.4.0 | Excel Export |
| **Socket.io Client** | 4.8.1 | Real-time Communication |

### Backend (Node.js API)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime Environment |
| **Express.js** | 5.1.0 | Web Framework |
| **Prisma** | 6.13.0 | ORM & Database Toolkit |
| **PostgreSQL** | Latest | Relational Database |
| **JWT** | 9.0.2 | Authentication |
| **Bcrypt** | 6.0.0 | Password Hashing |
| **Joi** | 17.13.3 | Data Validation |
| **Multer** | 2.0.1 | File Upload Handling |
| **Winston** | 3.17.0 | Logging |
| **Swagger** | Latest | API Documentation |
| **Nodemailer** | 6.10.1 | Email Service |
| **Redis** | 5.8.2 | Caching & Session Store |
| **Express Rate Limit** | 8.1.0 | API Rate Limiting |

### Landing Page (Next.js)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.2.4 | React Framework |
| **TypeScript** | 5+ | Type Safety |
| **Tailwind CSS** | 3.4.17 | Styling |
| **Radix UI** | Latest | Headless UI Components |
| **shadcn/ui** | Latest | UI Component Library |
| **Framer Motion** | 11.0.0 | Animation Library |
| **Lucide React** | Latest | Icon Library |
| **Next Themes** | Latest | Theme Management |
| **Formspree** | 2.5.1 | Form Handling |

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     StockPilot System                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Landing    │      │   Frontend   │      │  Backend  │ │
│  │   Page       │      │   (React)    │──────│  (Node.js)│ │
│  │  (Next.js)   │      │     SPA      │ API  │    API    │ │
│  └──────────────┘      └──────────────┘      └─────┬─────┘ │
│                                                      │        │
│                                               ┌──────┴─────┐ │
│                                               │ PostgreSQL │ │
│                                               │  Database  │ │
│                                               └────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Backend Architecture Pattern

The backend follows a **layered architecture** pattern:

```
┌─────────────────────────────────────────────┐
│              Routes Layer                    │  ← HTTP Endpoints
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

### Frontend State Management

```
┌─────────────────────────────────────────────┐
│         Redux Store (Global State)           │
├─────────────────────────────────────────────┤
│  • Auth State     • Products State           │
│  • User State     • Sales State              │
│  • Settings State • Purchase State           │
│  • UI State       • Reports State            │
└─────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** v14 or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager (comes with Node.js)
- **Git** ([Download](https://git-scm.com/downloads))

Optional but recommended:
- **Redis** for caching and session management
- **Docker** for containerized deployment

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/zacktam12/StockPilot.git
cd StockPilot
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Configure your `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/stockpilot"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRE="7d"

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# Redis Configuration (optional)
REDIS_URL="redis://localhost:6379"

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR="uploads"

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the database with initial data (optional)
npx prisma db seed
```

#### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Configure your frontend `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=StockPilot
VITE_SOCKET_URL=http://localhost:5000
```

#### 5. Landing Page Setup (Optional)

```bash
# Navigate to landing page directory
cd ../stockLandingPage

# Install dependencies
npm install
```

### Configuration

#### Backend Configuration Files

- **`prisma/schema.prisma`**: Database schema definition
- **`src/config/db.js`**: Database connection configuration
- **`src/config/jwt.js`**: JWT token configuration
- **`src/docs/swagger.js`**: API documentation configuration

#### Frontend Configuration Files

- **`vite.config.js`**: Vite build configuration
- **`tailwind.config.js`**: Tailwind CSS configuration
- **`src/config.js`**: Application-wide configuration

### Running the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

**Terminal 3 - Landing Page (Optional):**
```bash
cd stockLandingPage
npm run dev
```
Landing page will run on `http://localhost:3000`

#### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

**Landing Page:**
```bash
cd stockLandingPage
npm run build
npm start
```

### Default Login Credentials

After seeding the database, you can login with:

- **Email**: admin@stockpilot.com
- **Password**: admin123

⚠️ **Important**: Change these credentials immediately in production!

---

## 📚 API Documentation

### Swagger Documentation

The backend API is fully documented using Swagger/OpenAPI specification. Once the backend is running, you can access the interactive API documentation at:

```
http://localhost:5000/api-docs
```

### API Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:5000/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Main API Endpoints

#### Authentication & Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update user profile |
| GET | `/api/users` | Get all users (Admin) |
| POST | `/api/users` | Create user (Admin) |
| PUT | `/api/users/:id` | Update user (Admin) |
| DELETE | `/api/users/:id` | Delete user (Admin) |

#### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/products/bulk-import` | Import products via CSV |
| GET | `/api/products/low-stock` | Get low stock products |

#### Sales

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sales` | Get all sales |
| GET | `/api/sales/:id` | Get sale by ID |
| POST | `/api/sales` | Create sale |
| PUT | `/api/sales/:id` | Update sale |
| DELETE | `/api/sales/:id` | Delete sale |
| GET | `/api/sales/:id/invoice` | Generate invoice PDF |

#### Purchases

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/purchases` | Get all purchases |
| GET | `/api/purchases/:id` | Get purchase by ID |
| POST | `/api/purchases` | Create purchase |
| PUT | `/api/purchases/:id` | Update purchase |
| DELETE | `/api/purchases/:id` | Delete purchase |

#### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/:id` | Get customer by ID |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

#### Suppliers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers` | Get all suppliers |
| GET | `/api/suppliers/:id` | Get supplier by ID |
| POST | `/api/suppliers` | Create supplier |
| PUT | `/api/suppliers/:id` | Update supplier |
| DELETE | `/api/suppliers/:id` | Delete supplier |

#### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/:id` | Get category by ID |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

#### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/dashboard/recent-sales` | Get recent sales |
| GET | `/api/dashboard/top-products` | Get top-selling products |
| GET | `/api/dashboard/low-stock` | Get low stock alerts |

#### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/sales` | Get sales report |
| GET | `/api/reports/purchases` | Get purchases report |
| GET | `/api/reports/profit` | Get profit analysis |
| GET | `/api/reports/inventory` | Get inventory report |
| POST | `/api/reports/export` | Export report (PDF/Excel) |

#### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get system settings |
| PUT | `/api/settings` | Update settings |
| POST | `/api/settings/logo` | Upload company logo |

#### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/:id/read` | Mark notification as read |
| DELETE | `/api/notifications/:id` | Delete notification |

### Response Format

#### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Additional error details
  }
}
```

### Pagination

List endpoints support pagination with the following query parameters:

```
GET /api/products?page=1&limit=10&search=laptop&sortBy=createdAt&sortOrder=desc
```

Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search query
- `sortBy`: Field to sort by
- `sortOrder`: Sort order (asc/desc)

---

## 🎯 Features Deep Dive

### Role-Based Access Control (RBAC)

The system implements a comprehensive RBAC system with three main roles:

#### Admin Role
- Full system access
- User management
- System settings configuration
- All CRUD operations
- Report generation and export
- Database backup and restore

#### Manager Role
- Product management
- Sales and purchase operations
- Customer and supplier management
- Report viewing
- Limited user management (view only)

#### Staff Role
- Sales operations (POS)
- View products and prices
- Basic customer operations
- Limited reporting

### Real-time Features

The application uses WebSockets (Socket.io) for real-time features:

- **Live Notifications**: Instant alerts for low stock, new orders, etc.
- **Multi-user Updates**: See changes made by other users in real-time
- **Dashboard Updates**: Automatic dashboard refresh with new data

### Data Export & Import

#### Export Formats
- **PDF**: Invoices, receipts, reports
- **Excel**: Product catalogs, sales data, purchase records
- **CSV**: Bulk data export for analytics

#### Import Features
- **CSV Import**: Bulk product import with validation
- **Template Download**: Pre-formatted CSV templates
- **Error Handling**: Detailed error messages for import failures

### Search & Filtering

Advanced search and filtering capabilities:

- **Full-text Search**: Search across product names, SKUs, descriptions
- **Multi-field Filtering**: Filter by category, price range, stock level
- **Date Range**: Filter sales/purchases by date range
- **Status Filtering**: Filter by order status, payment status

### Inventory Tracking

Sophisticated inventory management:

- **Real-time Stock Updates**: Automatic stock adjustment on sales/purchases
- **Stock Movement History**: Complete audit trail of stock changes
- **Multi-location Support**: Track inventory across multiple warehouses
- **Reorder Point Alerts**: Automatic notifications when stock hits reorder level
- **FIFO/LIFO Support**: Flexible inventory valuation methods

---

## 🚢 Deployment

### Production Build

#### Backend

```bash
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
npm start
```

#### Frontend

```bash
cd frontend
npm install
npm run build
```

The built files will be in the `frontend/dist` directory.

#### Landing Page

```bash
cd stockLandingPage
npm install
npm run build
npm start
```

1. **Backend + Database**:
   - Render.com
   - Railway.app
   - Heroku
   - AWS Elastic Beanstalk
   - DigitalOcean App Platform

2. **Frontend**:
   - Vercel
   - Netlify
   - Cloudflare Pages
   - AWS S3 + CloudFront

3. **Landing Page**:
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS Amplify

### Environment Variables

#### Required Backend Environment Variables

```env
DATABASE_URL=
JWT_SECRET=
PORT=
NODE_ENV=production
CORS_ORIGIN=
```

#### Required Frontend Environment Variables

```env
VITE_API_URL=
VITE_APP_NAME=
```

### Render Deployment

The project includes `render.yaml` configuration for easy deployment to Render:

```bash
# Push to GitHub
git push origin main

# Connect repository to Render
# Render will automatically deploy using render.yaml
```

### Docker Deployment (Optional)

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: stockpilot
      POSTGRES_USER: stockpilot
      POSTGRES_PASSWORD: yourpassword
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://stockpilot:yourpassword@postgres:5432/stockpilot
      JWT_SECRET: your-jwt-secret
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Run with:

```bash
docker-compose up -d
```

---

## 👨‍💻 Author

**Zekarias Tamiru**

- GitHub: [@zacktam12](https://github.com/zacktam12)
- LinkedIn: [Zekarias Tamiru](https://www.linkedin.com/in/zekariastamiru)
- Email: stockpilotsales@gmail.com

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI Library
- [Node.js](https://nodejs.org/) - Runtime Environment
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Prisma](https://www.prisma.io/) - Database ORM
- [Next.js](https://nextjs.org/) - React Framework
- [Ant Design](https://ant.design/) - UI Components
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Chart.js](https://www.chartjs.org/) - Charts Library

---

## 📞 Support & Contact

- **Documentation**: [Wiki](https://github.com/zacktam12/StockPilot/wiki)
- **Issues**: [GitHub Issues](https://github.com/zacktam12/StockPilot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/zacktam12/StockPilot/discussions)
- **Email**: stockpilotsales@gmail.com

---

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics with ML predictions
- [ ] Multi-warehouse management
- [ ] Barcode scanning (mobile)
- [ ] Integration with e-commerce platforms
- [ ] Supplier portal
- [ ] Customer portal
- [ ] Advanced reporting dashboard
- [ ] Automated reordering
- [ ] Multi-currency support
- [ ] Multi-language support
- [ ] Offline mode support
- [ ] Advanced inventory tracking (serial numbers, batches)

### Version 1.5 (In Progress)
- [ ] Performance optimizations
- [ ] Enhanced security features
- [ ] Better mobile responsiveness
- [ ] Export templates customization
- [ ] Bulk operations improvements

---

<div align="center">

**Made with ❤️ by Zekarias Tamiru**

⭐ Star us on GitHub if you find this project useful!

[Report Bug](https://github.com/zacktam12/StockPilot/issues) · [Request Feature](https://github.com/zacktam12/StockPilot/issues) · [Documentation](https://github.com/zacktam12/StockPilot/wiki)

</div>

