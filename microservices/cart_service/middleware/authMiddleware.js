const { jwtVerify, createRemoteJWKSet } = require("jose");
console.log("========== USING JOSE AUTH MIDDLEWARE ==========");
const region = "ap-southeast-1";
const userPoolId =
  process.env.COGNITO_USER_POOL_ID || "ap-southeast-1_cPDXNClGu";

const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

// Cognito JWKS endpoint
const JWKS = createRemoteJWKSet(
  new URL(`${issuer}/.well-known/jwks.json`)
);

exports.verifyToken = async (req, res, next) => {
  console.log("verifyToken called");

  try {
    const auth = req.headers.authorization || req.headers.Authorization;

    if (!auth) {
      return res.status(401).json({
        message: "Authorization header missing",
      });
    }

    const parts = auth.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Invalid Authorization header",
      });
    }

    const token = parts[1];

    // Verify token using Cognito JWKS
    const { payload, protectedHeader } = await jwtVerify(token, JWKS, {
      issuer,
    });

    console.log("========== TOKEN VERIFIED ==========");
    console.log("Header:", protectedHeader);
    console.log("Payload:", payload);

    req.user = payload;

    next();
  } catch (err) {
    console.error("JWT Verification Failed");
    console.error(err);

    return res.status(401).json({
      message: "Invalid token",
      error: err.message,
    });
  }
};