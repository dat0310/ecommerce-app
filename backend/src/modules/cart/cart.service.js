const { getCartModel } = require('./cart.model');
const { getProductModel } = require('../product/product.model');
const { getUserModel } = require('../user/user.model');

const findCombinationPrice = (product, selectedOptions) => {
    if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
        return { price: product.price, stock: product.stock };
    }
    if (!product.productCombinations || product.productCombinations.length === 0) {
        return { price: product.price, stock: product.stock };
    }

    const combo = product.productCombinations.find(c => {
        const opts = c.options instanceof Map ? Object.fromEntries(c.options) : (c.options || {});
        return Object.keys(selectedOptions).every(k => opts[k] === selectedOptions[k]);
    });

    if (combo) {
        return { price: combo.price, stock: combo.stock };
    }
    return { price: product.price, stock: product.stock };
};

const fetchProduct = async (productId) => {
    const Product = getProductModel();
    return await Product.findById(productId);
};

const normalizeSelectedOptions = (selectedOptions = {}) => {
    const raw = selectedOptions instanceof Map
        ? Object.fromEntries(selectedOptions)
        : (selectedOptions || {});

    return Object.keys(raw)
        .sort()
        .reduce((acc, key) => {
            acc[key] = raw[key];
            return acc;
        }, {});
};

const getOptionsSignature = (selectedOptions = {}) => JSON.stringify(normalizeSelectedOptions(selectedOptions));

const isSameCartItem = (item, productId, selectedOptions) => {
    if (!item || item.productId !== productId) return false;
    if (!selectedOptions) return true;
    return getOptionsSignature(item.selectedOptions) === getOptionsSignature(selectedOptions);
};

const toPreferredSellerName = (userDoc, fallbackName = '') => {
    if (userDoc) {
        const firstName = typeof userDoc.firstName === 'string' ? userDoc.firstName.trim() : '';
        const lastName = typeof userDoc.lastName === 'string' ? userDoc.lastName.trim() : '';
        const fullName = `${firstName} ${lastName}`.trim();
        if (fullName) return fullName;
    }

    if (typeof fallbackName === 'string' && fallbackName.trim()) {
        return fallbackName.trim();
    }

    return 'Unknown seller';
};

const isObjectIdString = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

const getSellerNameMap = async (sellerIds = []) => {
    const ids = [...new Set(sellerIds.filter(isObjectIdString))];
    if (ids.length === 0) return new Map();

    const User = getUserModel();
    const users = await User.find({ _id: { $in: ids } }).select('_id firstName lastName');
    const sellerNameMap = new Map();

    users.forEach((user) => {
        sellerNameMap.set(
            user._id.toString(),
            toPreferredSellerName(user)
        );
    });

    return sellerNameMap;
};

const syncSellerNames = async (items = []) => {
    if (!Array.isArray(items) || items.length === 0) return items;

    const sellerNameMap = await getSellerNameMap(items.map(item => item.sellerId));
    items.forEach((item) => {
        const preferredName = sellerNameMap.get(item.sellerId);
        if (preferredName) {
            item.sellerName = preferredName;
        } else {
            item.sellerName = toPreferredSellerName(null, item.sellerName);
        }
    });

    return items;
};

const getCart = async (userId) => {
    const Cart = getCartModel();
    const cart = await Cart.findOne({ userId });
    if (cart) {
        await syncSellerNames(cart.items);
    }
    return cart || { userId, items: [] };
};

const replaceCart = async (userId, items) => {
    const Cart = getCartModel();
    const validatedItems = [];

    for (const item of items) {
        const p = await fetchProduct(item.productId);
        if (!p || p.stock <= 0) continue;

        const selectedOptions = item.selectedOptions || {};
        const { price, stock } = findCombinationPrice(p, selectedOptions);
        const qty = Math.max(1, Math.min(item.quantity || 1, stock));

        validatedItems.push({
            productId: p._id.toString(),
            name: p.name,
            price,
            image: p.image,
            category: p.category || '',
            stock,
            quantity: qty,
            sellerId: p.sellerId,
            sellerName: p.sellerName,
            selectedOptions
        });
    }

    await syncSellerNames(validatedItems);

    return await Cart.findOneAndUpdate(
        { userId },
        { items: validatedItems, updatedAt: Date.now() },
        { upsert: true, new: true }
    );
};

const addItem = async (userId, productId, quantity, selectedOptions = {}) => {
    const Cart = getCartModel();
    const product = await fetchProduct(productId);

    if (!product || product.stock <= 0) {
        throw new Error('Product not available');
    }

    const { price, stock } = findCombinationPrice(product, selectedOptions);
    if (stock <= 0) {
        throw new Error('Selected variant is out of stock');
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart({ userId, items: [] });
    }

    const optionsKey = getOptionsSignature(selectedOptions);
    const existing = cart.items.find(i => {
        const itemOpts = getOptionsSignature(i.selectedOptions);
        return i.productId === product._id.toString() && itemOpts === optionsKey;
    });

    if (existing) {
        existing.quantity = Math.min(existing.quantity + (quantity || 1), stock);
        existing.price = price;
        const sellerNameMap = await getSellerNameMap([existing.sellerId]);
        existing.sellerName = sellerNameMap.get(existing.sellerId) || toPreferredSellerName(null, existing.sellerName);
    } else {
        const sellerNameMap = await getSellerNameMap([product.sellerId]);
        cart.items.push({
            productId: product._id.toString(),
            name: product.name,
            price,
            image: product.image,
            category: product.category || '',
            stock,
            quantity: Math.min(quantity || 1, stock),
            sellerId: product.sellerId,
            sellerName: sellerNameMap.get(product.sellerId) || toPreferredSellerName(null, product.sellerName),
            selectedOptions
        });
    }

    cart.updatedAt = Date.now();
    return await cart.save();
};

const updateItemQuantity = async (userId, productId, quantity, selectedOptions) => {
    const Cart = getCartModel();
    const product = await fetchProduct(productId);
    if (!product) throw new Error('Product not found');

    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error('Cart not found');

    const targetSelectedOptions = selectedOptions ? normalizeSelectedOptions(selectedOptions) : selectedOptions;
    const item = cart.items.find(i => isSameCartItem(i, product._id.toString(), targetSelectedOptions));
    if (!item) throw new Error('Item not found in cart');

    const itemSelectedOptions = item.selectedOptions instanceof Map
        ? Object.fromEntries(item.selectedOptions)
        : (item.selectedOptions || {});
    const { stock } = findCombinationPrice(product, itemSelectedOptions);

    if (quantity <= 0) {
        cart.items = cart.items.filter(i => !isSameCartItem(i, product._id.toString(), targetSelectedOptions));
    } else {
        item.quantity = Math.min(quantity, stock);
    }

    cart.updatedAt = Date.now();
    return await cart.save();
};

const removeItem = async (userId, productId, selectedOptions) => {
    const Cart = getCartModel();
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error('Cart not found');

    const existingLength = cart.items.length;
    cart.items = cart.items.filter(i => !isSameCartItem(i, productId, selectedOptions));

    if (cart.items.length === existingLength) {
        throw new Error('Item not found in cart');
    }

    cart.updatedAt = Date.now();
    return await cart.save();
};

const clearCart = async (userId) => {
    const Cart = getCartModel();
    return await Cart.findOneAndUpdate(
        { userId },
        { items: [], updatedAt: Date.now() },
        { upsert: true, new: true }
    );
};

module.exports = {
    getCart,
    replaceCart,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart
};
