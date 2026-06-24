const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../.env')
});
console.log('MONGO_URI =', process.env.MONGO_URI);

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/products', require('./routes/productRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});