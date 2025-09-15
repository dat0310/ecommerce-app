# E-commerce Application - Development Setup

This guide will help you run the e-commerce application in development mode with the modern UI/UX.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)

## Quick Start (Development Mode)

### Option 1: Using Docker Compose (Recommended)

1. **Start all services with hot reload:**
   ```bash
   # Windows
   start-dev.bat
   
   # Linux/Mac
   chmod +x start-dev.sh
   ./start-dev.sh
   
   # Or manually
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the application:**
   - Frontend (with modern UI/UX): http://localhost:8080
   - API Gateway: http://localhost:3000
   - MongoDB: localhost:27017

### Option 2: Local Development

1. **Start backend services:**
   ```bash
   docker-compose up mongo api-gateway product-service user-service order-service
   ```

2. **Start frontend locally:**
   ```bash
   cd frontend
   npm install
   npm run serve
   ```

## Features

### Modern UI/UX Features
- ✨ **Modern Design System**: Custom CSS variables, gradients, and animations
- 🎨 **Glass Morphism**: Backdrop blur effects and transparency
- 📱 **Responsive Design**: Mobile-first approach with breakpoints
- 🎭 **Smooth Animations**: AOS (Animate On Scroll) and hover effects
- 🔔 **Toast Notifications**: Modern notification system
- 🎯 **Micro-interactions**: Subtle animations that provide feedback

### Components
- **Home Page**: Hero section with statistics, features, and product showcase
- **Products Page**: Advanced filtering, search, grid/list view, pagination
- **Cart Page**: Modern cart layout with quantity controls and order summary
- **Login/Register**: Glass morphism design with social login options
- **Product Detail**: Image gallery, modern quantity controls, product features

## Development Notes

### Hot Reload
The development setup includes hot reload for:
- Frontend changes (Vue components, CSS, etc.)
- Backend changes (Node.js services)

### Environment Variables
- `VUE_APP_API_URL`: API Gateway URL (default: http://localhost:3000)
- `NODE_ENV`: Environment mode (development/production)

### File Structure
```
frontend/
├── src/
│   ├── assets/css/modern.css    # Modern UI styles
│   ├── components/              # Vue components
│   ├── views/                   # Page components
│   └── main.js                  # Entry point with all imports
├── Dockerfile.dev               # Development Dockerfile
└── package.json                 # Dependencies
```

## Troubleshooting

### If UI/UX is not displaying:
1. Check if all dependencies are installed: `npm install`
2. Verify the development server is running: `npm run serve`
3. Check browser console for errors
4. Ensure all CSS files are being loaded

### If Docker containers fail to start:
1. Check if ports are available (8080, 3000, 27017)
2. Stop existing containers: `docker-compose down`
3. Rebuild containers: `docker-compose -f docker-compose.dev.yml up --build`

### Common Issues:
- **Port conflicts**: Change ports in docker-compose.dev.yml
- **Permission issues**: Run with appropriate permissions
- **Memory issues**: Increase Docker memory allocation

## Production Build

To build for production:
```bash
docker-compose up --build
```

This will use the production Dockerfile with nginx to serve static files.

## Support

If you encounter any issues, check:
1. Docker logs: `docker-compose logs frontend`
2. Browser developer tools console
3. Network tab for failed requests
