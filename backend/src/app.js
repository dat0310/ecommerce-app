const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Import routes
const userRoutes = require('./modules/user/user.routes');
const productRoutes = require('./modules/product/product.routes');
const orderRoutes = require('./modules/order/order.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const paymentRoutes = require('./modules/payment/payment.routes');
const chatRoutes = require('./modules/chat/chat.routes');
const voucherRoutes = require('./modules/voucher/voucher.routes');
const coinRoutes = require('./modules/coin/coin.routes');
const purchaseRoutes = require('./modules/purchase/purchase.routes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Static files for uploads
app.use('/uploads/products', express.static(path.join(__dirname, '../uploads/products')));
app.use('/uploads/chat', express.static(path.join(__dirname, '../uploads/chat')));

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce API',
            version: '1.0.0',
            description: 'Consolidated E-Commerce Backend API'
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Development server' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/modules/**/*.routes.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'E-Commerce Backend is running' });
});

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/my-purchases', purchaseRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: { message: err.message || 'Internal server error' }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: { message: 'Route not found' } });
});

module.exports = app;
