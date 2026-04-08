const { getOrdersByUserId } = require('../order/order.service');

const getPurchaseHistory = async (userId) => {
    return await getOrdersByUserId(userId);
};

module.exports = { getPurchaseHistory };
