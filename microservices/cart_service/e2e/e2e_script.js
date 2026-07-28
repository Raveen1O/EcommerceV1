const AWS = require('aws-sdk');
const axios = require('axios');

// Usage: node test/e2e_test.js <username> <password>
// Ensure environment variables set: COGNITO_USER_POOL_ID, COGNITO_APP_CLIENT_ID, API_BASE_URL

const username = process.argv[2];
const password = process.argv[3];

if(!username || !password){
  console.error('Usage: node test/e2e_test.js <username> <password>');
  process.exit(1);
}

const userPoolId = process.env.COGNITO_USER_POOL_ID || 'ap-southeast-1_cPDXNClGu';
const clientId = process.env.COGNITO_APP_CLIENT_ID || 'kubkbo5ehb5850ej5a5g9ilqu';
const region = process.env.AWS_REGION || 'ap-southeast-1';
const apiBase = process.env.API_BASE_URL || 'http://localhost:5003';

AWS.config.update({ region });
const cognito = new AWS.CognitoIdentityServiceProvider();

async function getTokens(){
  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password
    }
  };

  const resp = await cognito.initiateAuth(params).promise();
  return resp.AuthenticationResult; // contains IdToken, AccessToken, RefreshToken
}

async function test(){
  try{
    console.log('Getting Cognito tokens...');
    const tokens = await getTokens();
    console.log('Got tokens. IdToken length:', tokens.IdToken.length);

    const headers = { Authorization: `Bearer ${tokens.IdToken}` };

    console.log('Calling protected add-to-cart...');
    const addResp = await axios.post(`${apiBase}/api/cart/add`, { productId: 'demo-product', userId: username }, { headers });
    console.log('Add response:', addResp.data);

    console.log('Getting user cart...');
    const cartResp = await axios.get(`${apiBase}/api/cart/user/${username}`, { headers });
    console.log('Cart items:', cartResp.data);

    console.log('Calling checkout...');
    const checkoutResp = await axios.post(`${apiBase}/api/cart/checkout/${username}`, {}, { headers });
    console.log('Checkout response:', checkoutResp.data);

  }catch(err){
    console.error('Test failed:', err.response?.data || err.message);
    process.exit(2);
  }
}

test();
