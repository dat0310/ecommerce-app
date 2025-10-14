# TODO: Fix Session Expired Bug with Refresh Token Implementation

## Tasks
- [x] Update user-service/server.js: Add refresh token field to user schema, generate refresh tokens on login/register, create `/api/users/refresh-token` endpoint
- [x] Update frontend/src/store/index.js: Add refresh token state/mutations/actions, update login/register to store refresh token
- [x] Update frontend/src/main.js: Modify axios response interceptor to attempt token refresh on 401 before logging out
- [x] Test token refresh flow and order placement after refresh
- [x] Verify no infinite refresh loops
