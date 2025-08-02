# StockPilot - Inventory Management System

A modern, intelligent inventory management system designed for the digital age. Real-time tracking, powerful analytics, and seamless integration.

## 🚀 Quick Start

This project consists of three main components:

1. **Landing Page** (Next.js) - Marketing and introduction page
2. **Frontend Application** (React + Vite) - Main inventory management application
3. **Backend API** (Node.js + Express) - REST API and database

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL database

### Installation & Setup

#### 1. Backend Setup

```bash
cd backend
npm install
```

Configure your database in `backend/prisma/schema.prisma` and run:

```bash
npx prisma generate
npx prisma db push
npm run seed
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

#### 2. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5500`

#### 3. Landing Page Setup

```bash
cd LandingPage
npm install
```

Start the landing page:

```bash
npm run dev
```

The landing page will run on `http://localhost:3000`

## 🔗 Application Connection

The landing page is now connected to the frontend application:

- **Login Button** in the header redirects to the frontend login page
- **"Get Started Free"** buttons redirect to the frontend login page
- All login links open in a new tab for better user experience

### Configuration

You can customize the frontend URL by setting the environment variable:

```bash
# In LandingPage directory
NEXT_PUBLIC_FRONTEND_URL=http://localhost:5500
```

Or modify `LandingPage/lib/config.ts` for different environments.

## 🏗️ Project Structure

```
StockPilot/
├── backend/           # Node.js + Express API
├── frontend/          # React + Vite application
└── LandingPage/       # Next.js landing page
```

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev
```

### Frontend Development

```bash
cd frontend
npm run dev
```

### Landing Page Development

```bash
cd LandingPage
npm run dev
```

## 📦 Build for Production

### Backend
```bash
cd backend
npm run build
```

### Frontend
```bash
cd frontend
npm run build
```

### Landing Page
```bash
cd LandingPage
npm run build
```

## 🔧 Environment Variables

### Backend (.env)
```
DATABASE_URL="mysql://user:password@localhost:3306/stockpilot"
JWT_SECRET="your-jwt-secret"
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### Landing Page (.env.local)
```
NEXT_PUBLIC_FRONTEND_URL=http://localhost:5500
```

## 🚀 Features

- **Real-time Stock Tracking** - Monitor inventory levels across multiple locations
- **Smart Barcode Scanning** - Quick processing with built-in barcode and QR code scanning
- **Role-Based Access Control** - Customizable permission levels
- **Purchase & Sales Automation** - Streamlined workflow automation
- **Enterprise Security** - Bank-grade security with encryption and compliance
- **Advanced Analytics** - Customizable dashboards and exportable reports

## 🛡️ Security

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- SQL injection protection
- XSS protection

## 📊 Tech Stack

- **Frontend**: React, Redux Toolkit, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Prisma, MySQL
- **Landing Page**: Next.js, TypeScript, Tailwind CSS
- **Authentication**: JWT
- **Database**: MySQL
- **Real-time**: Socket.io

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ for modern businesses.
