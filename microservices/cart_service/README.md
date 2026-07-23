# Cart Service

This service exposes cart endpoints and includes Cognito JWT verification.

Setup

```bash
cd microservices/cart_service
npm install
# create a .env with API_BASE_URL, AWS_REGION (optional), COGNITO_USER_POOL_ID (optional)
node src/server.js
```

End-to-end test

Set environment variables and run the test script to authenticate with Cognito and call protected endpoints:

```bash
# from microservices/cart_service
export COGNITO_USER_POOL_ID=ap-southeast-1_cPDXNClGu
export COGNITO_APP_CLIENT_ID=kubkbo5ehb5850ej5a5g9ilqu
export AWS_REGION=ap-southeast-1
export API_BASE_URL=http://localhost:5003/
node test/e2e_test.js <username> <password>
```

Notes

- The service uses `src/middleware/auth.js` which validates Cognito JWTs using JWKS.
- Routes under `/api/cart` are protected; the middleware attaches `req.user` with the token payload.
