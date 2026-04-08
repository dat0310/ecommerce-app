const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticateToken, requireRole } = require('../../middleware/authMiddleware');

// Auth Routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshToken);

// Me Routes
router.get('/me', authenticateToken, userController.getMe);
router.patch('/me', authenticateToken, userController.updateMe);
router.get('/me/orders', authenticateToken, userController.getMyOrders);

// User Addresses
router.post('/addresses', authenticateToken, userController.addAddress);
router.put('/addresses/:addressId', authenticateToken, userController.updateAddress);
router.delete('/addresses/:addressId', authenticateToken, userController.deleteAddress);

// Password
router.put('/change-password', authenticateToken, userController.changePassword);

// Admin Routes for Users Management
router.get('/', authenticateToken, requireRole(['admin']), userController.getAllUsers);
router.get('/role/:role', authenticateToken, requireRole(['admin']), userController.getUsersByRole);
router.get('/:id', authenticateToken, requireRole(['admin']), userController.getUserById);
router.patch('/:id', authenticateToken, requireRole(['admin']), userController.updateUser);
router.delete('/:id', authenticateToken, requireRole(['admin']), userController.deleteUser);
router.patch('/:id/role', authenticateToken, requireRole(['admin']), userController.updateUserRole);
router.patch('/:id/status', authenticateToken, requireRole(['admin']), userController.toggleUserStatus);

module.exports = router;
