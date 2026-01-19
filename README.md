# 🛍️ Bolpur Mart - Quick Commerce PWA

## Overview
Bolpur Mart is a modern Progressive Web App (PWA) for quick commerce, offering time-based ordering of groceries, vegetables, fruits, medicine, and food delivery in Bolpur. Built with Next.js 14, TypeScript, and Tailwind CSS, it provides a native app-like experience with offline capabilities.

## ✨ Key Features

### Time-Based Ordering
- 🌅 **Morning**: Fresh vegetables and fruits
- 🌞 **Afternoon**: Groceries, medicine, and snacks
- 🌙 **Evening**: Biryani and prepared food items

### Shopping Experience
- 🔍 Smart search with AI-powered suggestions
- 📱 Mobile-first responsive design
- 🛒 Real-time cart management
- 📍 Multiple delivery address support
- 💳 Multiple payment method integration
- 🎯 Personalized product recommendations

### PWA Capabilities
- 📲 Install as native app on any device
- 🔄 Offline functionality
- 🔔 Push notifications for order updates
- 🚀 Fast loading and smooth navigation
- 🔒 Secure data handling

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form + Zod

### Backend
- **API**: Next.js API Routes
- **Database**: Vercel Postgres
- **ORM**: Drizzle
- **AI Integration**: Google Gemini
- **Storage**: Cloudinary (media)

### PWA Features
- Service Worker with offline caching
- Push notifications
- Background sync
- App manifest
- Installable on all devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm or pnpm
- Vercel account (for deployment)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bolpur-mart.git
   cd bolpur-mart
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your environment variables in `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 PWA Installation
1. Open the app in Chrome/Safari
2. Click "Add to Home Screen"
3. Follow browser prompts to install

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=your_api_url
POSTGRES_URL=your_postgres_url
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## 📦 Project Structure
```
├── app/                # Next.js app directory
├── components/         # Reusable UI components
├── lib/               # Utility functions and services
├── public/            # Static assets
├── styles/            # Global styles
└── types/             # TypeScript type definitions
```

## 🤝 Contributing
Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors
- Your Name - Initial work

## 🙏 Acknowledgments
- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Vercel](https://vercel.com)