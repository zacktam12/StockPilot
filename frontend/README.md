# StockPilot Frontend

<div align="center">

**Modern React SPA for Inventory Management**

[![React](https://img.shields.io/badge/React-v19.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-v6.3-purple.svg)](https://vitejs.dev/)
[![Redux](https://img.shields.io/badge/Redux-v2.8-violet.svg)](https://redux-toolkit.js.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v3.4-cyan.svg)](https://tailwindcss.com/)

</div>

---

## 📋 Overview

The StockPilot frontend is a modern, responsive Single Page Application (SPA) built with React 19 and Vite. It provides an intuitive interface for managing inventory, sales, purchases, customers, and suppliers with real-time updates and beautiful visualizations.

## ✨ Key Features

- **Modern UI/UX**: Beautiful, intuitive interface built with Ant Design and custom components
- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile
- **Real-time Updates**: WebSocket integration for instant notifications
- **Dark/Light Theme**: User-preferred theme with system detection
- **Redux State Management**: Centralized state management with Redux Toolkit
- **Data Visualization**: Interactive charts and graphs with Chart.js and Recharts
- **Advanced Tables**: Sortable, filterable, paginated tables with search
- **PDF/Excel Export**: Export reports and invoices
- **Form Validation**: Comprehensive client-side validation
- **Protected Routes**: Role-based route protection
- **Optimized Performance**: Code splitting and lazy loading
- **Accessibility**: WCAG 2.1 compliant components

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.0 | UI Library |
| **Vite** | 6.3.5 | Build Tool |
| **Redux Toolkit** | 2.8.2 | State Management |
| **React Router** | 7.6.2 | Routing |
| **Ant Design** | 5.27.4 | UI Components |
| **Tailwind CSS** | 3.4.17 | Styling |
| **Chart.js** | 4.4.9 | Charts |
| **Recharts** | 2.15.4 | React Charts |
| **Axios** | 1.9.0 | HTTP Client |
| **React Query** | 5.80.2 | Data Fetching |
| **Socket.io Client** | 4.8.1 | WebSocket |
| **jsPDF** | 3.0.1 | PDF Generation |
| **ExcelJS** | 4.4.0 | Excel Export |

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   
   Create a `.env` file in the frontend directory:
   
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=StockPilot
   VITE_SOCKET_URL=http://localhost:5000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── main.jsx               # Entry point
│   ├── App.jsx                # Root component
│   ├── index.css              # Global styles
│   ├── config.js              # App configuration
│   │
│   ├── features/              # Feature-based modules
│   │   ├── auth/
│   │   │   ├── components/    # Auth-specific components
│   │   │   ├── pages/         # Login, Register pages
│   │   │   └── modals/        # Auth modals
│   │   ├── dashboard/
│   │   │   ├── components/    # Dashboard widgets
│   │   │   ├── pages/         # Dashboard page
│   │   │   └── hooks/         # Dashboard hooks
│   │   ├── products/
│   │   │   ├── components/    # Product components
│   │   │   ├── pages/         # Product list, details
│   │   │   ├── modals/        # Product modals
│   │   │   └── drawers/       # Product drawers
│   │   ├── sales/
│   │   ├── purchase/
│   │   ├── customers/
│   │   ├── suppliers/
│   │   ├── users/
│   │   ├── category/
│   │   ├── report/
│   │   └── settings/
│   │
│   ├── components/            # Shared components
│   │   ├── header/
│   │   │   ├── Header.jsx
│   │   │   └── NotificationPanel.jsx
│   │   ├── sidebar/
│   │   │   └── Sidebar.jsx
│   │   └── shared/
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Card.jsx
│   │       ├── Table.jsx
│   │       ├── Modal.jsx
│   │       ├── Pagination.jsx
│   │       └── ...
│   │
│   ├── store/                 # Redux store
│   │   ├── index.js           # Store configuration
│   │   ├── slices/            # Redux slices
│   │   │   ├── authSlice.js
│   │   │   ├── productSlice.js
│   │   │   ├── saleSlice.js
│   │   │   └── ...
│   │   └── middleware/
│   │       ├── loadingMiddleware.js
│   │       └── debounceMiddleware.js
│   │
│   ├── services/              # API services
│   │   ├── api.js             # API client
│   │   ├── http.js            # HTTP utilities
│   │   └── ...
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuthCheck.js
│   │   ├── useDebounce.js
│   │   ├── usePagination.js
│   │   └── ...
│   │
│   ├── routes/                # Route definitions
│   │   └── AppRoutes.jsx
│   │
│   ├── layouts/               # Layout components
│   │   └── ProtectedLayout.jsx
│   │
│   ├── contexts/              # React contexts
│   │   └── NotificationContext.jsx
│   │
│   ├── utils/                 # Utilities
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   ├── constants.js
│   │   └── csvUtils.js
│   │
│   └── styles/                # Additional styles
│       ├── global.css
│       ├── sidebar.css
│       └── settings.css
│
├── public/
│   ├── logo.png
│   ├── favicon.png
│   └── _redirects            # Netlify redirects
│
├── dist/                     # Build output
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── package.json
```

## 🗄️ State Management

### Redux Store Structure

```javascript
{
  auth: {
    user: {},
    token: '',
    isAuthenticated: false
  },
  products: {
    items: [],
    selectedProduct: null,
    loading: false,
    filters: {}
  },
  sales: {
    items: [],
    cart: [],
    loading: false
  },
  // ... other slices
}
```

## 🔌 API Integration

The app uses Axios for API communication with the backend:

```javascript
// Base URL from environment
VITE_API_URL=http://localhost:5000/api
```

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Ant Design**: Professional UI components
- **Custom Styles**: Feature-specific styling

## 📊 Data Visualization

- **Chart.js**: Line charts, bar charts, pie charts
- **Recharts**: Advanced React charts

## 🔔 Real-time Features

WebSocket integration for:
- Live notifications
- Stock updates
- Multi-user synchronization

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deployment Platforms

- **Vercel** (Recommended)
- **Netlify**
- **AWS Amplify**
- **Cloudflare Pages**

## 👨‍💻 Author

**Zekarias Tamiru**

- GitHub: [@zacktam12](https://github.com/zacktam12)
- LinkedIn: [Zekarias Tamiru](https://www.linkedin.com/in/zekariastamiru)
- Email: stockpilotsales@gmail.com

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/zacktam12/StockPilot/issues)
- **Documentation**: [Wiki](https://github.com/zacktam12/StockPilot/wiki)

---

<div align="center">

**Built with ❤️ using React and Vite by Zekarias Tamiru**

</div>
