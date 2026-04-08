const jwt = require('jsonwebtoken');
const { getUserModel } = require('./user.model');

class UserController {
    async register(req, res) {
        try {
            const User = getUserModel();
            const { firstName, lastName, email, password, phone, role } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email.' });
            }

            const validRoles = ['customer', 'admin', 'seller'];
            const userRole = role && validRoles.includes(role) ? role : 'customer';

            const user = new User({
                firstName,
                lastName,
                email,
                password,
                phone,
                role: userRole
            });

            const token = user.generateAuthToken();
            const refreshToken = user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save();

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
            const User = getUserModel();
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid email or password.' });
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid email or password.' });
            }

            if (!user.isActive) {
                return res.status(400).json({ message: 'Account is deactivated.' });
            }

            const token = user.generateAuthToken();
            const refreshToken = user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save();

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
            res.status(500).json({ message: error.message });
        }
    }

    async getMe(req, res) {
        try {
            const User = getUserModel();
            const user = await User.findById(req.user.id).select('-password -refreshToken');
            
            if (!user) {
                return res.status(404).json({ error: { message: 'User not found' } });
            }
            
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
            res.json(userResponse);
        } catch (error) {
            res.status(500).json({ error: { message: error.message } });
        }
    }

    async updateMe(req, res) {
        try {
            const User = getUserModel();
            const updateData = { ...req.body };
            if (updateData.password) delete updateData.password;
            updateData.updatedAt = Date.now();

            const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
            res.json({ message: 'Profile updated successfully', user });
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
    }

    async getAllUsers(req, res) {
        try {
            const User = getUserModel();
            const users = await User.find().select('-password').sort({ createdAt: -1 });
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getUserById(req, res) {
        try {
            const User = getUserModel();
            const user = await User.findById(req.params.id).select('-password');
            if (!user) return res.status(404).json({ error: { message: 'User not found' } });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: { message: error.message } });
        }
    }

    async updateUser(req, res) {
        try {
            const User = getUserModel();
            const updateData = { ...req.body };
            if (updateData.password) delete updateData.password;
            updateData.updatedAt = Date.now();

            const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
            if (!user) return res.status(404).json({ error: { message: 'User not found' } });
            res.json({ message: 'User updated successfully', user });
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
    }

    async deleteUser(req, res) {
        try {
            const User = getUserModel();
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async changePassword(req, res) {
        try {
            const User = getUserModel();
            const { currentPassword, newPassword } = req.body;

            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ error: { message: 'User not found' } });

            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({ error: { message: 'Current password is incorrect' } });
            }

            user.password = newPassword;
            user.updatedAt = Date.now();
            await user.save();
            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
    }

    async addAddress(req, res) {
        try {
            const User = getUserModel();
            const user = await User.findById(req.user.id);

            if (user.addresses.length === 0) {
                req.body.isDefault = true;
            }

            if (req.body.isDefault) {
                user.addresses.forEach(address => {
                    address.isDefault = false;
                });
            }

            user.addresses.push(req.body);
            user.updatedAt = Date.now();
            await user.save();

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
            const User = getUserModel();
            const user = await User.findById(req.user.id);
            const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.addressId);

            if (addressIndex === -1) {
                return res.status(404).json({ message: 'Address not found' });
            }

            if (req.body.isDefault) {
                user.addresses.forEach(address => {
                    address.isDefault = false;
                });
            }

            user.addresses[addressIndex] = {
                ...user.addresses[addressIndex].toObject(),
                ...req.body
            };

            user.updatedAt = Date.now();
            await user.save();

            res.json({
                message: 'Address updated successfully',
                addresses: user.addresses
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteAddress(req, res) {
        try {
            const User = getUserModel();
            const user = await User.findById(req.user.id);
            const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.addressId);

            if (addressIndex === -1) {
                return res.status(404).json({ message: 'Address not found' });
            }

            const wasDefault = user.addresses[addressIndex].isDefault;
            user.addresses.splice(addressIndex, 1);

            if (wasDefault && user.addresses.length > 0) {
                user.addresses[0].isDefault = true;
            }

            user.updatedAt = Date.now();
            await user.save();

            res.json({
                message: 'Address deleted successfully',
                addresses: user.addresses
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getMyOrders(req, res) {
        try {
            // Direct call to order module instead of HTTP
            const { getOrdersByUserId } = require('../order/order.service');
            const orders = await getOrdersByUserId(req.user.id);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Error fetching orders.' });
        }
    }

    async getUsersByRole(req, res) {
        try {
            const User = getUserModel();
            const { role } = req.params;
            const validRoles = ['customer', 'admin', 'seller'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: 'Invalid role specified.' });
            }
            const users = await User.find({ role }).select('-password').sort({ createdAt: -1 });
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateUserRole(req, res) {
        try {
            const User = getUserModel();
            const { role } = req.body;
            const validRoles = ['customer', 'admin', 'seller'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: 'Invalid role specified.' });
            }
            const user = await User.findByIdAndUpdate(
                req.params.id,
                { role, updatedAt: Date.now() },
                { new: true }
            ).select('-password');
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json({ message: 'User role updated successfully', user });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async toggleUserStatus(req, res) {
        try {
            const User = getUserModel();
            const user = await User.findByIdAndUpdate(
                req.params.id,
                { isActive: req.body.isActive, updatedAt: Date.now() },
                { new: true }
            ).select('-password');
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
            const User = getUserModel();
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({ message: 'Refresh token is required.' });
            }

            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user || user.refreshToken !== refreshToken) {
                return res.status(401).json({ message: 'Invalid refresh token.' });
            }

            const newToken = user.generateAuthToken();
            const newRefreshToken = user.generateRefreshToken();

            user.refreshToken = newRefreshToken;
            await user.save();

            res.json({
                message: 'Token refreshed successfully',
                token: newToken,
                refreshToken: newRefreshToken
            });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
}

module.exports = new UserController();
