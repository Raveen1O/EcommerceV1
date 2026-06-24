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
app.use(cors());

app.use('/api/orders', require('./routes/orderRoutes'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});