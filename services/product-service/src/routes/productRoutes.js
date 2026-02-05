const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Public Routes
router.get('/', productController.getApprovedProducts);
router.get('/test-pending', productController.getPendingProducts); // Kept for consistency with original, maybe remove later?

// Seller Routes
router.get('/seller/my-products', authenticateToken, requireRole(['seller']), productController.getSellerProducts);
router.post('/', authenticateToken, requireRole(['seller']), productController.createProduct);

// Admin Routes
router.get('/pending', authenticateToken, requireRole(['admin']), productController.getPendingProducts);
router.get('/admin/all', authenticateToken, requireRole(['admin']), productController.getAllProducts);
router.patch('/:id/status', authenticateToken, requireRole(['admin']), productController.updateProductStatus);

// ID Routes (Dynamic) - Must be later
// We need middleware to check role for 'getProductById' logic if it depends on role?
// Actually original 'getProductById' checked req.user manually inside logic if present.
// Since `authenticateToken` is not applied globally, we might need a "loose" authentication that doesn't fail if no token?
// Or we just handle it inside controller. BUT `req.user` needs to be populated.
// The original code did `(!req.user || ...)` implying req.user might be missing.
// However, `authenticateToken` middleware effectively sets `req.user`.
// So we should try to authenticate if token exists, but not fail if it doesn't?
// The original code didn't use middleware on that route.
// Let's create a "optionalAuth" middleware? 
// Or just replicate logic: if simple GET /:id, it's public. If admin wants to see unapproved, they need token.
// The controller uses `req.user`. So we need to parse token if present.

// Let's use a helper for optional auth in this specific route or just use authenticateToken but make it not error?
// The standard authenticateToken errors if no token.
// Original code: app.get('/api/products/:id', async (req, res) => { ... checks req.user ... })
// But WHERE did req.user come from in original code for that route?
// `app.use` wasn't used globally for auth.
// So `req.user` would be undefined unless some global middleware set it?
// Looking at original `server.js`: `app.use(express.json()); app.use(cors());` - NO global auth middleware.
// So `req.user` in `app.get('/api/products/:id'` was ALWAYS UNDEFINED.
// Wait, `if (product.status !== 'approved' && (!req.user || req.user.role !== 'admin'))`
// If `req.user` is undefined, this is true. So only approved products are shown.
// If an admin wants to see it, they MUST have `req.user` set. But there was no middleware on that route!
// So effectively, even admins couldn't see unapproved products via that route in the original code!
// I will fix this by using `authenticateToken` but modifying it or creating `optionalAuthenticateToken`.

const optionalAuthenticateToken = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return next();

    // Reuse logic from authMiddleware (importing jwt etc needed if we duplicate, or export helper)
    // To avoid circular dep or duplicating, I'll just use the controller to handle "if user is present".
    // But I need to populate user.
    // Ideally, I should import `jsonwebtoken` and `process.env` here or export a `verifyToken` function.
    // For now I'll just let it be "public" (no user) or require user if they provide header?
    // I will just use the `authenticateToken` if header is present, else next.

    // Actually, I can just use a specific middleware here.
    const jwt = require('jsonwebtoken');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id || decoded._id || decoded.userId,
            email: decoded.email,
            role: decoded.role || 'customer'
        };
    } catch (e) {
        // ignore invalid token for optional auth?
    }
    next();
};

router.get('/:id', optionalAuthenticateToken, productController.getProductById);

router.patch('/:id', authenticateToken, productController.updateProduct);
router.delete('/:id', authenticateToken, productController.deleteProduct);

module.exports = router;
