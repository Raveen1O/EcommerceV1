const AWSXRay = require('aws-xray-sdk');
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));

const { handler } = require('./src/services/handler');

exports.handler = handler;
// Triggering CI/CD pipeline and security scans for deployment
