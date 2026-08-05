const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const AWSXRay = require('aws-xray-sdk');
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));

const connectDB = require('./config/db');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(AWSXRay.express.openSegment('PaymentService'));

connectDB();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());

app.use('/api/payments', paymentRoutes);

app.use(AWSXRay.express.closeSegment());

module.exports.handler = serverless(app);