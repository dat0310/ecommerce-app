# TODO: Fix 404 on /api/payments/create-payment-intent

## Steps to Complete:
- [x] Create payment-service directory structure
- [x] Implement payment-service/server.js with Stripe PaymentIntent endpoint
- [x] Create payment-service/package.json with required dependencies
- [x] Create payment-service/Dockerfile
- [x] Add payment-service to docker-compose.yml
- [x] Update api-gateway/server.js with Swagger docs for payments endpoint
- [x] Add payment-service dependency to api-gateway in docker-compose.yml
- [ ] Test the implementation by running docker-compose up --build
