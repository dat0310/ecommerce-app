# E-Commerce Application

A full-stack E-Commerce application built with **Node.js**, **Express**, **MongoDB**, and **Vue.js**, containerized with **Docker & Docker Compose**.

## 🏗 Architecture Overview

This project uses a **Consolidated Modular Monolith** architecture for the backend and a **Single Page Application (SPA)** for the frontend:

- **Frontend (`/frontend`)**: Built with Vue.js 3, Vue Router, Vuex, and Axios.
- **Backend (`/backend`)**: Consolidated Express.js server organized by domain modules (`src/modules/*`).
- **Database (`/mongo`)**: MongoDB 5 instance with isolated database collections for each module (`userdb`, `productdb`, `orderdb`, `cartdb`, `chatdb`, `voucherdb`, `coindb`).

### Backend Modules & Features

- 👤 **User Module**: User registration, authentication (JWT), profiles, seller/customer roles.
- 🛍 **Product Module**: Product catalog, category management, image uploads.
- 🛒 **Cart Module**: Shopping cart management.
- 📦 **Order Module**: Order creation, tracking, and status updates.
- 💳 **Payment Module**: Integration with **Stripe** (Payment Intents).
- 💬 **Chat Module**: Real-time customer support & chat message history.
- 🏷 **Voucher Module**: Discount codes and promotional vouchers.
- 🪙 **Coin Module**: Reward points and coin balance management.
- 📜 **Purchase Module**: Order history & purchase tracking for buyers.

---

## 🚀 Quick Start with Docker

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.

### Running the Application

1. **Clone the repository** (if not already cloned):
   ```bash
   git clone <repository-url>
   cd ecommerce-app
   ```

2. **Environment Configuration**:
   - Create or verify `.env` files in root, `backend/.env`, and `frontend/.env`.
   - Update `STRIPE_SECRET_KEY` and `VUE_APP_STRIPE_PUBLISHABLE` if using Stripe test keys.

3. **Start services using Docker Compose**:
   ```bash
   docker-compose up -d --build
   ```

4. **Access Applications**:
   - **Frontend App**: [http://localhost:8080](http://localhost:8080)
   - **Backend API**: [http://localhost:3000](http://localhost:3000)
   - **Swagger API Docs**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
   - **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=3000
MONGODB_USER_URI=mongodb://mongo:27017/userdb
MONGODB_PRODUCT_URI=mongodb://mongo:27017/productdb
MONGODB_ORDER_URI=mongodb://mongo:27017/orderdb
MONGODB_CART_URI=mongodb://mongo:27017/cartdb
MONGODB_CHAT_URI=mongodb://mongo:27017/chatdb
MONGODB_VOUCHER_URI=mongodb://mongo:27017/voucherdb
MONGODB_COIN_URI=mongodb://mongo:27017/coindb

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

STRIPE_SECRET_KEY=sk_test_...
```

### Frontend (`frontend/.env`)

```env
VUE_APP_API_URL=http://localhost:3000
VUE_APP_STRIPE_PUBLISHABLE=pk_test_...
```

---

## 🛠 Project Directory Structure

```text
ecommerce-app/
├── backend/
│   ├── src/
│   │   ├── modules/       # Domain modules (user, product, cart, order, etc.)
│   │   ├── middleware/    # Auth & error handling middlewares
│   │   ├── config/        # Database & app configurations
│   │   ├── utils/         # Helper functions
│   │   └── app.js         # Express app entry point
│   ├── uploads/           # Uploaded images (products, chat)
│   └── server.js          # HTTP server initializer
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios API modules
│   │   ├── components/    # Reusable Vue components
│   │   ├── views/         # Vue views / page components
│   │   ├── composables/   # Composition functions
│   │   └── router/        # Vue Router configuration
│   └── public/
├── docker-compose.yml     # Container orchestration specification
└── README.md
```

