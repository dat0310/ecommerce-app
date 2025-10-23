# E-commerce App

This is an e-commerce application built with Node.js, Express, MongoDB, and Vue.js.

## Services

- **API Gateway**: The single entry point for all client requests.
- **Product Service**: Manages products.
- **User Service**: Manages users.
- **Order Service**: Manages orders.
- **Cart Service**: Manages shopping carts.
- **Frontend**: The Vue.js client application.

## Getting Started

To get started, you will need to have Docker and Docker Compose installed.

1. Clone the repository.
2. Run `docker-compose up -d --build` to build and start the services.
3. The application will be available at `http://localhost:8080`.

## Stripe (Payments) setup

To enable Stripe payments locally and in Docker, follow these steps:

- Do NOT commit your secret key to source control.
- Copy `payment-service/.env.example` to `payment-service/.env` and set your Stripe secret key there:

	STRIPE_SECRET_KEY=sk_test_...

- For the frontend, copy `frontend/.env.example` to `frontend/.env.local` (or set environment variables) and set the publishable key:

	VUE_APP_STRIPE_PUBLISHABLE=pk_test_...

- To run with docker-compose and pass the secret via an env file, create a top-level `.env.dev` (not committed) containing:

	STRIPE_SECRET_KEY=sk_test_...

	Then start services with:

	docker-compose --env-file .env.dev up --build

- Alternatively you can export environment variables in your shell before running individual services.

The payment service exposes an endpoint at `/api/payments/create-payment-intent` (proxied through the API gateway at `http://localhost:3000/api/payments/create-payment-intent`) which the frontend uses to obtain a PaymentIntent client secret.
