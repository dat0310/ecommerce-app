const http = require('http');

// Helper function to make HTTP requests
function request(options, body = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch(e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function test() {
    // 1. Login as buyer to get token
    console.log('=== Step 1: Login as buyer ===');
    let loginRes = await request({
        hostname: 'localhost', port: 3000, path: '/api/users/login',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { email: 'buyer@test.com', password: 'password123' });
    
    if (loginRes.status !== 200) {
        console.log('Login failed, trying to register...');
        // Try registering
        const regRes = await request({
            hostname: 'localhost', port: 3000, path: '/api/users/register',
            method: 'POST', headers: { 'Content-Type': 'application/json' }
        }, { name: 'Test Buyer', email: 'buyer@test.com', password: 'password123', role: 'buyer' });
        console.log('Register:', regRes.status);
        
        loginRes = await request({
            hostname: 'localhost', port: 3000, path: '/api/users/login',
            method: 'POST', headers: { 'Content-Type': 'application/json' }
        }, { email: 'buyer@test.com', password: 'password123' });
        
        if (loginRes.status !== 200) {
            console.log('Still cannot login:', loginRes.data);
            return;
        }
    }
    
    const token = loginRes.data.token;
    console.log('Login successful, got token');
    
    // 2. Get a product with stock
    console.log('\n=== Step 2: Get products ===');
    const productsRes = await request({
        hostname: 'localhost', port: 3000, path: '/api/products',
        method: 'GET', headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!productsRes.data.products || productsRes.data.products.length === 0) {
        console.log('No products found');
        return;
    }
    
    const product = productsRes.data.products.find(p => p.stock > 0);
    if (!product) {
        console.log('No products with stock > 0');
        return;
    }
    
    console.log('Selected product:', product.name);
    console.log('Product ID:', product._id);
    console.log('Initial Stock:', product.stock);
    const initialStock = product.stock;
    
    // 3. Create an order
    console.log('\n=== Step 3: Create order ===');
    const orderRes = await request({
        hostname: 'localhost', port: 3000, path: '/api/orders',
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    }, {
        products: [{ productId: product._id, quantity: 1, price: product.price, sellerId: product.sellerId }],
        shippingAddress: { street: '123 Test St', city: 'TestCity', postalCode: '12345', country: 'USA' },
        paymentMethod: 'cod',
        totalAmount: product.price
    });
    
    if (orderRes.status !== 201) {
        console.log('Order creation failed:', orderRes.status, orderRes.data);
        return;
    }
    
    const orderId = orderRes.data._id;
    console.log('Order created successfully!');
    console.log('Order ID:', orderId);
    
    // 4. Check stock after order
    console.log('\n=== Step 4: Check stock after order ===');
    const stockAfterOrder = await request({
        hostname: 'localhost', port: 3000, path: '/api/products/' + product._id,
        method: 'GET', headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log('Stock after order:', stockAfterOrder.data.stock, '(was:', initialStock, ')');
    
    // 5. Cancel the order
    console.log('\n=== Step 5: Cancel order ===');
    const cancelRes = await request({
        hostname: 'localhost', port: 3000, path: '/api/orders/' + orderId + '/cancel',
        method: 'PATCH', headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (cancelRes.status === 200) {
        console.log('Order cancelled successfully!');
    } else {
        console.log('Cancel failed:', cancelRes.status, cancelRes.data);
    }
    
    // 6. Check stock after cancellation
    console.log('\n=== Step 6: Check stock after cancellation ===');
    const stockAfterCancel = await request({
        hostname: 'localhost', port: 3000, path: '/api/products/' + product._id,
        method: 'GET', headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log('Stock after cancel:', stockAfterCancel.data.stock);
    
    // 7. Summary
    console.log('\n========================================');
    console.log('              TEST RESULT');
    console.log('========================================');
    console.log('Initial stock:      ', initialStock);
    console.log('After order:        ', stockAfterOrder.data.stock);
    console.log('After cancellation: ', stockAfterCancel.data.stock);
    console.log('----------------------------------------');
    
    if (stockAfterCancel.data.stock === initialStock) {
        console.log('✅ SUCCESS: Stock was restored after cancellation!');
    } else if (stockAfterCancel.data.stock > stockAfterOrder.data.stock) {
        console.log('✅ SUCCESS: Stock increased after cancellation!');
        console.log('   (Initial stock may have changed due to other orders)');
    } else {
        console.log('❌ FAILED: Stock was not restored.');
        console.log('   Expected:', initialStock, 'Got:', stockAfterCancel.data.stock);
    }
}

test().catch(err => {
    console.error('Test error:', err.message);
    process.exit(1);
});
