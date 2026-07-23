const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Product = require('./src/models/Product');

const seedProducts = [
  {
    name: 'Lumina Trench Coat',
    description: 'A modern trench coat tailored for the city.',
    price: 250,
    stock: 10,
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Lumina Puffer',
    description: 'Warm, lightweight, and stylish puffer jacket.',
    price: 180,
    stock: 15,
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Cashmere Sweater',
    description: 'Ultra-soft cashmere sweater for everyday comfort.',
    price: 120,
    stock: 5,
    category: 'Knitwear',
    imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Wool Cardigan',
    description: 'Heavy knit cardigan with architectural lines.',
    price: 90,
    stock: 8,
    category: 'Knitwear',
    imageUrl: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Leather Belt',
    description: 'Premium Italian leather belt with a minimalist buckle.',
    price: 45,
    stock: 20,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Silk Scarf',
    description: 'Pure silk printed scarf with modern abstract patterns.',
    price: 65,
    stock: 12,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Chelsea Boots',
    description: 'Suede chelsea boots combining comfort and sharp aesthetics.',
    price: 150,
    stock: 10,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Minimalist Sneakers',
    description: 'White leather sneakers that pair perfectly with any outfit.',
    price: 110,
    stock: 25,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60'
  }
];

async function runSeed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    for (const p of seedProducts) {
      await Product.create(p);
      console.log(`Created product: ${p.name}`);
    }

    console.log('Successfully seeded products.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding products:', err);
    process.exit(1);
  }
}

runSeed();
