const userRepository = require('../repositories/userRepository');
const jwt = require('jsonwebtoken');

class UserService {
    async register(userData) {
        const { firstName, lastName, email, password, phone, role } = userData;

        // Check if user already exists
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists with this email.');
        }

        // Validate role if provided
        const validRoles = ['customer', 'admin', 'seller'];
        const userRole = role && validRoles.includes(role) ? role : 'customer';

        // Create new user
        const newUser = {
            firstName,
            lastName,
            email,
            password,
            phone,
            role: userRole
        };

        const user = await userRepository.create(newUser);

        // Generate tokens
        const token = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();

        // Save refresh token to user
        user.refreshToken = refreshToken;
        await userRepository.save(user);

        return { user, token, refreshToken };
    }

    async login(email, password) {
        // Check if user exists
        const user = await userRepository.findByEmail(email);
        // We need password so we fetch it separately or rely on findOne yielding it if select was not excluded.
        // The repository findByEmail does NOT exclude password (it uses findOne which returns full doc by default unless schema selects: false)
        // Wait, repository logic for other methods hides password. findByEmail is just `findOne`.
        // However, we need to be careful. The repository usually returns Mongoose documents.

        // Actually, looking at repo code: `return await User.findOne({ email });` returns full doc including password.

        if (!user) {
            throw new Error('Invalid email or password.');
        }

        // Check if password is correct
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password.');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new Error('Account is deactivated.');
        }

        // Generate tokens
        const token = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();

        // Save refresh token to user
        user.refreshToken = refreshToken;
        await userRepository.save(user);

        return { user, token, refreshToken };
    }

    async getUserById(id) {
        return await userRepository.findById(id);
    }

    async updateUserProfile(id, updateData) {
        if (updateData.password) delete updateData.password;
        updateData.updatedAt = Date.now();
        return await userRepository.updateById(id, updateData);
    }

    async getAllUsers() {
        return await userRepository.findAll();
    }

    async deleteUser(id) {
        return await userRepository.deleteById(id);
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await userRepository.findByIdWithPassword(userId);
        if (!user) throw new Error('User not found');

        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        user.password = newPassword;
        user.updatedAt = Date.now();
        await userRepository.save(user);
    }

    async addAddress(userId, addressData) {
        const user = await userRepository.findByIdWithPassword(userId); // Need full doc to access addresses array methods
        if (user.addresses.length === 0) {
            addressData.isDefault = true;
        }

        if (addressData.isDefault) {
            user.addresses.forEach(address => {
                address.isDefault = false;
            });
        }

        user.addresses.push(addressData);
        user.updatedAt = Date.now();
        return await userRepository.save(user);
    }

    async updateAddress(userId, addressId, addressData) {
        const user = await userRepository.findByIdWithPassword(userId);
        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);

        if (addressIndex === -1) {
            throw new Error('Address not found');
        }

        if (addressData.isDefault) {
            user.addresses.forEach(address => {
                address.isDefault = false;
            });
        }

        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex].toObject(),
            ...addressData
        };

        user.updatedAt = Date.now();
        return await userRepository.save(user);
    }

    async deleteAddress(userId, addressId) {
        const user = await userRepository.findByIdWithPassword(userId);
        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);

        if (addressIndex === -1) {
            throw new Error('Address not found');
        }

        const wasDefault = user.addresses[addressIndex].isDefault;
        user.addresses.splice(addressIndex, 1);

        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        user.updatedAt = Date.now();
        return await userRepository.save(user);
    }

    async getUsersByRole(role) {
        return await userRepository.findByRole(role);
    }

    async updateUserRole(id, role) {
        return await userRepository.updateById(id, { role, updatedAt: Date.now() });
    }

    async toggleUserStatus(id, isActive) {
        return await userRepository.updateById(id, { isActive, updatedAt: Date.now() });
    }

    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new Error('Refresh token is required.');
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

        // Find user by ID and check if refresh token matches
        const user = await userRepository.findByIdWithPassword(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            throw new Error('Invalid refresh token.');
        }

        // Generate new tokens
        const newToken = user.generateAuthToken();
        const newRefreshToken = user.generateRefreshToken();

        // Update refresh token in database
        user.refreshToken = newRefreshToken;
        await userRepository.save(user);

        return { token: newToken, refreshToken: newRefreshToken };
    }
}

module.exports = new UserService();
