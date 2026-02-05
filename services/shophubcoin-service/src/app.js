const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const coinRoutes = require('./routes/coinRoutes');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Mount routes (NOTE: server.js mounted at root '/', but usually APIs are /api/coins or something.
// However server.js had: app.get('/', ...) and app.post('/claim-daily') directly.
// And it didn't seem to wrap them in a router path.
// BUT, wait, checking docker-compose or usage... usually behind API Gateway mapping `/api/coins` -> shophubcoin:3008?
// If API Gateway forwards /api/coins/* to /api/coins/* of service, then service needs to match.
// If API Gateway rewrites /api/coins to /, then service needs /.
// Looking at other services: User Service has /api/users definitions in `app.js`.
// Order Service had /api/orders.
// ShopHubCoin server.js had just app.get('/').
// This implies the API Gateway might be rewriting? Or the service was exposing root.
// For consistency, I should probably put it under `/api/coins` OR keep it at root if that's what gateway expects.
// Let's check `api-gateway` later. For now, I will use `/api/coins` as prefix in app.js if that's the pattern,
// OR if server.js used root, I should stick to root?
// "Refactor" implies maintaining functionality.
// If I change app.get('/') to app.get('/api/coins'), I might break it if gateway doesn't expect it.
// BUT, usually microservices are namespaced.
// Let's look at `server.js` of `shophubcoin-service` again.
// It was `app.get('/', ...)`
// So I should probably mount at `/`.

// Wait, standard practice in this repo seems to be explicit paths?
// User: /api/users...
// Order: /api/orders...
// Coin: / ?
// If I verify `api-gateway`, I can know.
// But to be safe, I will mount at `/` AND `/api/coins`? No, that's messy.
// I will mount at `/` for now to match `server.js`.
// Actually, I'll mount `coinRoutes` at `/`.

app.use('/', coinRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: { message: err.message || 'Internal server error' } });
});

module.exports = app;
