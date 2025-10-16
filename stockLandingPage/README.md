# StockPilot Landing Page

<div align="center">

**Modern Next.js Landing Page with TypeScript**

[![Next.js](https://img.shields.io/badge/Next.js-v15.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v3.4-cyan.svg)](https://tailwindcss.com/)
[![Radix UI](https://img.shields.io/badge/Radix%20UI-latest-purple.svg)](https://www.radix-ui.com/)

</div>

---

## 📋 Overview

The StockPilot landing page is a modern, responsive website built with Next.js 15, TypeScript, and Tailwind CSS. It showcases the features and benefits of the StockPilot inventory management system with beautiful animations, dark/light theme support, and mobile-first design.

## ✨ Key Features

- **Modern Design**: Clean, professional UI with smooth animations
- **Responsive Layout**: Optimized for all screen sizes
- **Dark/Light Theme**: Automatic theme detection with manual toggle
- **TypeScript**: Type-safe code for better maintainability
- **SEO Optimized**: Meta tags, structured data, and sitemap
- **Fast Performance**: Next.js App Router with server components
- **Framer Motion**: Smooth, engaging animations
- **shadcn/ui Components**: Beautiful, accessible UI components
- **Contact Form**: Integrated contact form with Formspree
- **Video Demo**: Product demonstration video section

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.2.4 | React Framework |
| **React** | 18.2.0 | UI Library |
| **TypeScript** | 5+ | Type Safety |
| **Tailwind CSS** | 3.4.17 | Styling |
| **Radix UI** | Latest | Headless Components |
| **shadcn/ui** | Latest | UI Components |
| **Framer Motion** | 11.0.0 | Animations |
| **Lucide React** | Latest | Icons |
| **Next Themes** | Latest | Theme Management |
| **Formspree** | 2.5.1 | Form Handling |
| **Zod** | 3.24.1 | Validation |

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

The site will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## 📁 Project Structure

```
stockLandingPage/
├── app/
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx        # Navigation bar
│   │   └── Footer.tsx        # Footer
│   │
│   ├── sections/             # Page sections
│   │   ├── HeroSection.tsx   # Hero banner
│   │   ├── FeaturesSection.tsx
│   │   ├── DemoSection.tsx
│   │   ├── UseCasesSection.tsx
│   │   ├── TrustSection.tsx
│   │   ├── CTASection.tsx
│   │   └── ContactSection.tsx
│   │
│   ├── ui/                   # shadcn/ui components
│   │
│   ├── theme-provider.tsx    # Theme provider
│   └── theme-toggle.tsx      # Theme toggle button
│
├── lib/
│   ├── utils.ts              # Utility functions
│   └── config.ts             # Configuration
│
├── hooks/
│   ├── use-mobile.tsx        # Mobile detection hook
│   └── use-toast.ts          # Toast notification hook
│
├── public/                   # Static assets
│   ├── logo.png
│   ├── Inventory-Management.jpg
│   └── stockpilot-demo.mp4
│
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── components.json
└── package.json
```

## 🎨 Page Sections

- **Hero Section**: Engaging hero banner with CTA
- **Features Section**: Key product features
- **Demo Section**: Product demonstration video
- **Use Cases**: Target audience examples
- **Trust Section**: Customer testimonials
- **CTA Section**: Call-to-action
- **Contact Section**: Contact form

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Manual Deployment

```bash
# Build
npm run build

# Output is in .next folder
```

## 🎨 Customization

### Change Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    DEFAULT: '#your-color',
    foreground: '#text-color',
  },
}
```

### Update Content

Edit section components in `components/sections/`

## 👨‍💻 Author

**Zekarias Tamiru**

- GitHub: [@zacktam12](https://github.com/zacktam12)
- LinkedIn: [Zekarias Tamiru](https://www.linkedin.com/in/zekariastamiru)
- Email: stockpilotsales@gmail.com

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/zacktam12/StockPilot/issues)
- **Documentation**: [Next.js Docs](https://nextjs.org/docs)

---

<div align="center">

**Built with ❤️ using Next.js and TypeScript by Zekarias Tamiru**

</div>
