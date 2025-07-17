# FitZone Website Setup Instructions

## Prerequisites

Before running the project, make sure you have the following installed:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud)
3. **Git** - [Download here](https://git-scm.com/)

## Quick Start Guide

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/fitzone-website.git
cd fitzone-website

# Install all dependencies (frontend and backend)
npm install
```

### 2. Environment Setup

Create the following environment files:

#### Frontend Environment (`.env` in root directory):
```env
VITE_API_URL=http://localhost:5000/api
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_APP_NAME=FitZone
VITE_APP_VERSION=1.0.0
```

#### Backend Environment (`server/.env`):
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/fitzone
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_12345
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@fitzone.com
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
OPENAI_API_KEY=your_openai_api_key
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET=your_session_secret_here
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install and start MongoDB locally
2. The application will automatically connect to `mongodb://localhost:27017/fitzone`

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `server/.env`

#### Seed Sample Data (Optional)
```bash
npm run seed
```

### 4. Start the Application

#### Option A: Start Both Frontend and Backend Together
```bash
npm run dev:full
```

#### Option B: Start Separately
```bash
# Terminal 1 - Start Backend
cd server
npm run dev

# Terminal 2 - Start Frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## Features Available

### ✅ Working Features
- User authentication (signup/signin)
- Shopping cart functionality
- Program browsing and details
- Service information
- Pricing plans
- Contact form
- Healthcare AI assistant
- Responsive design
- Order management (basic)

### 🔧 Optional Integrations
- **OpenAI API**: For enhanced AI responses (requires API key)
- **Stripe**: For payment processing (requires API keys)
- **Email Service**: For notifications (requires SMTP setup)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Make sure MongoDB is running locally
   - Check your connection string in `server/.env`

2. **Port Already in Use**
   - Change the PORT in `server/.env`
   - Or kill the process using the port

3. **Dependencies Issues**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

4. **Environment Variables Not Loading**
   - Make sure `.env` files are in the correct locations
   - Restart the development servers

### Development Commands

```bash
# Install dependencies
npm install

# Start development (both frontend and backend)
npm run dev:full

# Start only frontend
npm run dev

# Start only backend
cd server && npm run dev

# Build for production
npm run build

# Seed database with sample data
npm run seed

# Lint code
npm run lint
```

## Project Structure

```
fitzone-website/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── store/             # State management (Zustand)
│   └── ...
├── server/                # Backend Node.js application
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── utils/             # Utility functions
│   └── ...
├── .env                   # Frontend environment variables
├── server/.env            # Backend environment variables
└── ...
```

## Next Steps

1. **Customize the content** in the components to match your gym's information
2. **Set up payment processing** by adding your Stripe keys
3. **Configure email service** for notifications
4. **Add your OpenAI API key** for enhanced AI features
5. **Deploy to production** using services like Netlify (frontend) and Railway/Heroku (backend)

## Support

If you encounter any issues:
1. Check this setup guide
2. Review the console logs for error messages
3. Ensure all environment variables are set correctly
4. Make sure MongoDB is running and accessible

Happy coding! 🚀