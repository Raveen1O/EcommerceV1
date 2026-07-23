const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../.env')
});

const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();

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

module.exports.handler = serverless(app);