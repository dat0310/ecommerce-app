require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const { connectAllDatabases } = require('./src/config/database');
const { initializeSocket } = require('./src/modules/chat/chat.socket');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Start server
const startServer = async () => {
    try {
        // Connect to all databases
        console.log('Connecting to databases...');
        await connectAllDatabases();
        console.log('All databases connected successfully');

        // Initialize Socket.io for chat
        initializeSocket(io);
        console.log('Socket.io initialized');

        // Start listening
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║    E-Commerce Backend Server Started                      ║
║                                                           ║
║   Server:     http://localhost:${PORT}                    ║
║   API Docs:   http://localhost:${PORT}/api-docs           ║
║   Health:     http://localhost:${PORT}/health             ║
║                                                           ║
║   API Endpoints:                                          ║
║   • /api/users      - User management                     ║
║   • /api/products   - Product catalog                     ║
║   • /api/orders     - Order management                    ║
║   • /api/cart       - Shopping cart                       ║
║   • /api/payments   - Payment processing                  ║
║   • /api/chat       - Real-time chat                      ║
║   • /api/vouchers   - Voucher management                  ║
║   • /api/coins      - ShopHubCoin loyalty                 ║
║   • /api/my-purchases - Purchase history                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

startServer();
