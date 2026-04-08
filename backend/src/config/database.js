const mongoose = require('mongoose');

const connections = {};

const connectDB = async (name, uri) => {
    try {
        const conn = await mongoose.createConnection(uri);
        console.log(`MongoDB Connected: ${name} - ${conn.host || 'localhost'}`);
        connections[name] = conn;
        return conn;
    } catch (error) {
        console.error(`Error connecting to ${name}:`, error.message);
        throw error;
    }
};

const connectAllDatabases = async () => {
    const dbConfigs = [
        { name: 'user', uri: process.env.MONGODB_USER_URI },
        { name: 'product', uri: process.env.MONGODB_PRODUCT_URI },
        { name: 'order', uri: process.env.MONGODB_ORDER_URI },
        { name: 'cart', uri: process.env.MONGODB_CART_URI },
        { name: 'chat', uri: process.env.MONGODB_CHAT_URI },
        { name: 'voucher', uri: process.env.MONGODB_VOUCHER_URI },
        { name: 'coin', uri: process.env.MONGODB_COIN_URI }
    ];

    for (const config of dbConfigs) {
        if (config.uri) {
            await connectDB(config.name, config.uri);
        }
    }

    return connections;
};

const getConnection = (name) => {
    if (!connections[name]) {
        throw new Error(`Database connection '${name}' not found`);
    }
    return connections[name];
};

module.exports = {
    connectAllDatabases,
    getConnection,
    connections
};
