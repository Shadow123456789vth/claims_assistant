# Claims Portal - DXC Halstack

Claims Portal built with React, TypeScript, Vite, and DXC Halstack design system, integrated with ServiceNow backend.

## Project Structure

```
claims_halstack/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components (ClaimsList, ClaimDetail, NewClaim)
│   ├── services/       # API services (ServiceNow integration)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── assets/         # Static assets (images, fonts, etc.)
│   ├── App.tsx         # Main App component with routing
│   ├── main.tsx        # React entry point
│   └── index.css       # Global styles
├── public/             # Public static files
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts (ROOT LEVEL)
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── README.md           # This file
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

1. Update the ServiceNow instance URL in `vite.config.ts`:
   ```typescript
   proxy: {
     '/api': {
       target: 'https://your-servicenow-instance.service-now.com',
       changeOrigin: true,
       secure: false,
     },
   }
   ```

2. Configure ServiceNow CORS settings to allow requests from your development domain

## Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Features

- ✅ Claims list view with sortable table
- ✅ Claim detail view
- ✅ New claim creation form
- ✅ ServiceNow REST API integration
- ✅ DXC Halstack design system
- ✅ TypeScript for type safety
- ✅ Path aliases for clean imports
- ✅ Vite for fast development and optimized builds

## ServiceNow Integration

The application connects to ServiceNow through REST API endpoints:

- `GET /api/now/table/x_claims` - Fetch all claims
- `GET /api/now/table/x_claims/{sys_id}` - Fetch single claim
- `POST /api/now/table/x_claims` - Create new claim
- `PUT /api/now/table/x_claims/{sys_id}` - Update existing claim

## Path Aliases

The project uses path aliases for cleaner imports:

```typescript
import Component from '@components/Component'
import { Claim } from '@types/claim'
import serviceNowAPI from '@services/serviceNowAPI'
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **DXC Halstack** - Design system and UI components
- **Axios** - HTTP client for API calls
- **ServiceNow** - Backend platform
