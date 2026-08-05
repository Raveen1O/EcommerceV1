const path = require('path');

require('dotenv').config({
    path: path.join(__dirname, '../.env')
});

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(express.json());

// CORS configuration to allow cross-origin requests
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests

app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});