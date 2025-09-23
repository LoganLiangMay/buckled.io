# Buckled.io - AI-Powered Fair Automotive Pricing Platform

https://buckled-io.vercel.app/

🚗 **Stop getting overcharged at mechanic shops. Get fair, transparent pricing powered by AI.**

## Overview
Buckled.io is an intelligent automotive service platform that uses AI to analyze repair quotes and provide fair pricing information. Our system helps customers understand automotive service costs and find trusted mechanics in their area.

## 🌟 Key Features

### For Customers
- ✅ **AI-Powered Quote Analysis**: Upload receipts or describe service needs
- ✅ **Smart Text Correction**: Automatically corrects typos ("oild change" → "Oil Change")
- ✅ **Vehicle-Specific Pricing**: Accurate estimates based on year, make, and model
- ✅ **Service Cost Breakdown**: Detailed parts and labor pricing
- ✅ **Trusted Shop Directory**: Find vetted mechanics near you
- ✅ **Local Storage**: Secure data storage with IndexedDB
- ✅ **Document Analysis**: AI extracts 20+ data points from service documents

### For Mechanics
- ✅ **Business Dashboard**: Manage quotes and customer requests
- ✅ **Shop Profile Management**: Showcase services and certifications
- ✅ **Customer Communication**: Handle quote requests efficiently

### AI & Intelligence
- ✅ **OpenRouter Integration**: Multiple AI models for text and vision processing
- ✅ **Rate Limiting Protection**: Smart fallbacks when API limits hit
- ✅ **Confidence Scoring**: All extracted data includes confidence levels
- ✅ **Smart Context Management**: Vehicle profiling and recommendations

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.4 + Framer Motion
- **AI Integration**: OpenRouter API with multiple models
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **Storage**: IndexedDB for local data persistence
- **Build**: Vite with TypeScript compilation

## Getting Started

### Prerequisites
- Node.js (v20.19+ or v22.12+ recommended)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd buckled-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
- Main site: http://localhost:5173/
- Customer app: http://localhost:5173/app
- Business dashboard: http://localhost:5173/business

## Project Structure
```
src/
├── components/
│   ├── common/         # Reusable UI components
│   └── landing/        # Landing page sections
├── pages/              # Main page components
├── data/               # Mock data and constants
├── types/              # TypeScript type definitions
└── App.tsx             # Main app with routing
```

## Available Routes
- `/` - Landing page
- `/app` - Customer application
- `/app/login` - Customer login
- `/app/signup` - Customer registration
- `/business` - Business dashboard
- `/business/login` - Business login
- `/business/signup` - Business registration

## Key Features

### For Customers
- Add and manage multiple vehicles
- Browse available services with price estimates
- View mechanic shops in your area
- Request quotes from shops
- See transparent pricing breakdowns

### For Mechanics
- View incoming service requests
- Manage quotes (pending, approved, rejected)
- Track business statistics
- Respond to customer inquiries

## Mock Data
The application uses mock data for demonstration purposes, including:
- Sample vehicle makes and models
- Service categories and pricing
- Mechanic shop listings
- Quote and request examples

## Future Enhancements
- Backend API integration
- Real Google Vision API for invoice scanning
- Database for persistent data
- Payment processing
- Real-time notifications
- Advanced search and filtering
- Review and rating system
- Appointment scheduling

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## License
This is a demo project for Buckled.io.
