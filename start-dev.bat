@echo off
echo Starting E-commerce Application in Development Mode...
echo.
echo This will start all services with hot reload enabled.
echo Frontend will be available at: http://localhost:8080
echo API Gateway will be available at: http://localhost:3000
echo.

docker-compose -f docker-compose.dev.yml up --build
