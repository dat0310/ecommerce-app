const userService = require('../services/userService');
const axios = require('axios');

class UserController {
    async register(req, res) {
        try {
            const { user, token, refreshToken } = await userService.register(req.body);

            // Return user data without password (already handled by repo/model logic mostly, but let's be explicit)
            const userResponse = {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                addresses: user.addresses,
                avatar: user.avatar,
                createdAt: user.createdAt
            };

            res.status(201).json({
                message: 'User registered successfully',
                token,
                refreshToken,
                user: userResponse
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { user, token, refreshToken } = await userService.login(email, password);

            const userResponse = {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                addresses: user.addresses,
                avatar: user.avatar,
                createdAt: user.createdAt
            };

            res.json({
                message: 'Login successful',
                token,
                refreshToken,
                user: userResponse
            });
        } catch (error) {
            // Distinguish 500 vs 400? Usually logic errors are 400
            if (error.message === 'Invalid email or password.' || error.message === 'Account is deactivated.') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async getMe(req, res) {
        try {
            console.log('getMe - req.user before destructure:', JSON.stringify(req.user));
            const { profile, ...user } = req.user;
            console.log('getMe - returning user:', JSON.stringify(user));
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: { message: error.message } });
        }
    }

    async updateMe(req, res) {
        try {
            const user = await userService.updateUserProfile(req.user.id, req.body);
            res.json({ message: 'Profile updated successfully', user });
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await userService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getUserById(req, res) {
        try {
            const user = await userService.getUserById(req.params.id);
            if (!user) return res.status(404).json({ error: { message: 'User not found' } });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: { message: error.message } });
        }
    }

    async updateUser(req, res) {
        try {
            const user = await userService.updateUserProfile(req.params.id, req.body);
            if (!user) return res.status(404).json({ error: { message: 'User not found' } });
            res.json({ message: 'User updated successfully', user });
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
    }

    async deleteUser(req, res) {
        try {
            const user = await userService.deleteUser(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            await userService.changePassword(req.user.id, currentPassword, newPassword);
            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
    }

    async addAddress(req, res) {
        try {
            const user = await userService.addAddress(req.user.id, req.body);
            res.json({
                message: 'Address added successfully',
                addresses: user.addresses
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateAddress(req, res) {
        try {
            const user = await userService.updateAddress(req.user.id, req.params.addressId, req.body);
            res.json({
                message: 'Address updated successfully',
                addresses: user.addresses
            });
        } catch (error) {
            if (error.message === 'Address not found') return res.status(404).json({ message: error.message });
            res.status(400).json({ message: error.message });
        }
    }

    async deleteAddress(req, res) {
        try {
            const user = await userService.deleteAddress(req.user.id, req.params.addressId);
            res.json({
                message: 'Address deleted successfully',
                addresses: user.addresses
            });
        } catch (error) {
            if (error.message === 'Address not found') return res.status(404).json({ message: error.message });
            res.status(400).json({ message: error.message });
        }
    }

    async getMyOrders(req, res) {
        try {
            console.log('Fetching orders for user:', req.user.id);
            const orderServiceUrl = process.env.ORDER_SERVICE_URL;
            if (!orderServiceUrl) {
                console.error('ORDER_SERVICE_URL is not defined in the environment variables.');
                return res.status(500).json({ message: 'Service configuration error.' });
            }

            const response = await axios.get(`${orderServiceUrl}/api/orders/user/${req.user.id}`, {
                headers: {
                    'Authorization': req.header('Authorization')
                }
            });

            console.log('Orders fetched successfully for user:', req.user.id);
            res.json(response.data);
        } catch (error) {
            console.error('Error fetching orders for user:', req.user.id, error.message);
            res.status(error.response?.status || 500).json({ message: error.response?.data?.message || 'Error fetching orders.' });
        }
    }

    async getUsersByRole(req, res) {
        try {
            const { role } = req.params;
            const validRoles = ['customer', 'admin', 'seller'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: 'Invalid role specified.' });
            }
            const users = await userService.getUsersByRole(role);
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateUserRole(req, res) {
        try {
            const { role } = req.body;
            const validRoles = ['customer', 'admin', 'seller'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: 'Invalid role specified.' });
            }
            const user = await userService.updateUserRole(req.params.id, role);
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json({ message: 'User role updated successfully', user });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async toggleUserStatus(req, res) {
        try {
            const user = await userService.toggleUserStatus(req.params.id, req.body.isActive);
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json({
                message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
                user
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async refreshToken(req, res) {
        try {
            const { token, refreshToken } = await userService.refreshToken(req.body.refreshToken);
            res.json({
                message: 'Token refreshed successfully',
                token,
                refreshToken
            });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
}

module.exports = new UserController();
