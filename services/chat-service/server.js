const http = require('http');
const app = require('./src/app');
const { Server } = require('socket.io');
const { initializeSocket } = require('./src/socket');
require('dotenv').config();

const PORT = process.env.PORT || 3009;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
    path: '/socket.io'
});

initializeSocket(io);

server.listen(PORT, () => {
    console.log(`Chat service running on port ${PORT}`);
});
