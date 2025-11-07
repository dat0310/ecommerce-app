# TODO: Update Voucher Application and Shipping Fee

## Tasks
- [x] Add `/api/vouchers/apply` endpoint in voucher-service/server.js to validate voucher codes
- [x] Remove shipping cost from Cart.vue order summary
- [x] Update Checkout.vue to add voucher input and apply functionality
- [x] Add shipping cost to Checkout.vue order summary
- [x] Restructure Checkout.vue order summary to show: product name, shipping, discount (if applied), divide line, total
- [x] Update total calculations to include shipping and voucher discounts
- [x] Include voucher details in order data when placing order

## Testing
- [ ] Test voucher application with valid codes
- [ ] Test voucher application with invalid codes
- [ ] Verify total calculations include shipping and discount properly
- [ ] Test checkout flow with and without vouchers
