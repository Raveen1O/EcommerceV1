const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');

const region = 'ap-southeast-1';
const userPoolId = process.env.COGNITO_USER_POOL_ID || 'ap-southeast-1_cPDXNClGu';
const iss = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

const client = jwksClient({
  jwksUri: `${iss}/.well-known/jwks.json`
});

function getKey(header, callback){
  client.getSigningKey(header.kid, function(err, key){
    if(err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

exports.verifyToken = (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if(!auth) return res.status(401).json({ message: 'Unauthorized' });

  const parts = auth.split(' ');
  if(parts.length !== 2) return res.status(401).json({ message: 'Invalid auth header' });

  const token = parts[1];

  jwt.verify(token, getKey, { issuer: iss }, (err, decoded) => {
    if(err) {
      return res.status(401).json({ message: 'Invalid token', error: err.message });
    }

    // Attach user info
    req.user = decoded;
    next();
  });
};
