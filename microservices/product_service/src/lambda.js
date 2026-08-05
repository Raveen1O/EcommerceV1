const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../.env')
});

const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

const AWSXRay = require('aws-xray-sdk');
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));

const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(AWSXRay.express.openSegment('ProductService'));

// Enable CORS so API Gateway responses include Access-Control-Allow-* headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());

connectDB();

app.use('/api/products', productRoutes);

app.use(AWSXRay.express.closeSegment());

module.exports.handler = serverless(app);