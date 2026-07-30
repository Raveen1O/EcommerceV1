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
    name: 'Wool Overcoat',
    description: 'A classic wool overcoat for formal and casual occasions.',
    price: 210,
    stock: 12,
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Denim Jacket',
    description: 'Vintage wash denim jacket with a modern fit.',
    price: 95,
    stock: 30,
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Bomber Jacket',
    description: 'Sleek bomber jacket with water-resistant finish.',
    price: 140,
    stock: 20,
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=500&auto=format&fit=crop&q=60'
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
    name: 'Turtleneck Knit',
    description: 'Cozy and stylish turtleneck knit for chilly days.',
    price: 110,
    stock: 15,
    category: 'Knitwear',
    imageUrl: 'https://images.unsplash.com/photo-1628520118714-50a6fb7b3f94?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Cable Knit Sweater',
    description: 'Classic cable knit design with a relaxed fit.',
    price: 85,
    stock: 25,
    category: 'Knitwear',
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'V-Neck Pullover',
    description: 'Essential v-neck pullover made from fine merino wool.',
    price: 95,
    stock: 18,
    category: 'Knitwear',
    imageUrl: 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=500&auto=format&fit=crop&q=60'
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
    name: 'Aviator Sunglasses',
    description: 'Classic aviator sunglasses with polarized lenses.',
    price: 120,
    stock: 10,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Leather Wallet',
    description: 'Slim bifold wallet crafted from genuine leather.',
    price: 55,
    stock: 30,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Canvas Tote Bag',
    description: 'Durable everyday canvas tote with spacious interior.',
    price: 35,
    stock: 40,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1597248374161-426f0d6d2fc9?w=500&auto=format&fit=crop&q=60'
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
  },
  {
    name: 'Oxford Shoes',
    description: 'Elegant leather oxford shoes for formal attire.',
    price: 180,
    stock: 15,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1614252339474-12ec28b4c029?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Running Trainers',
    description: 'Lightweight and breathable trainers for active wear.',
    price: 130,
    stock: 20,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Leather Loafers',
    description: 'Slip-on leather loafers offering both style and comfort.',
    price: 140,
    stock: 12,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1557088190-21a48c4a4574?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Fleece Zip-Up',
    description: 'Cozy fleece zip-up jacket for outdoor adventures.',
    price: 85,
    stock: 40,
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1548624149-16dfb776ec7c?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Windbreaker Jacket',
    description: 'Lightweight windbreaker with a modern color block design.',
    price: 75,
    stock: 25,
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1545594861-3bef43702b86?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Quilted Vest',
    description: 'Versatile quilted vest for layering in transitional weather.',
    price: 90,
    stock: 20,
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Parka Coat',
    description: 'Heavy-duty parka coat designed for extreme cold.',
    price: 220,
    stock: 15,
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Leather Moto Jacket',
    description: 'Classic leather moto jacket with asymmetrical zip.',
    price: 350,
    stock: 10,
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Chunky Knit Sweater',
    description: 'Hand-knitted chunky sweater with an oversized fit.',
    price: 130,
    stock: 18,
    category: 'Knitwear',
    imageUrl: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Merino Wool Vest',
    description: 'Sleek merino wool vest perfect over collared shirts.',
    price: 80,
    stock: 30,
    category: 'Knitwear',
    imageUrl: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Ribbed Cardigan',
    description: 'Soft ribbed cardigan with button-down front.',
    price: 95,
    stock: 22,
    category: 'Knitwear',
    imageUrl: 'https://images.unsplash.com/photo-1589311283626-d66885df400b?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Alpaca Blend Sweater',
    description: 'Luxurious alpaca blend sweater for ultimate warmth.',
    price: 160,
    stock: 12,
    category: 'Knitwear',
    imageUrl: 'https://images.unsplash.com/photo-1614838634842-882ab27eaec8?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Striped Crewneck',
    description: 'Classic striped crewneck sweater with a relaxed silhouette.',
    price: 75,
    stock: 35,
    category: 'Knitwear',
    imageUrl: 'https://images.unsplash.com/photo-1574200171926-778846c243bc?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Beanie Hat',
    description: 'Warm knit beanie available in multiple colors.',
    price: 25,
    stock: 50,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Leather Gloves',
    description: 'Supple leather gloves with cashmere lining.',
    price: 85,
    stock: 20,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1520106206124-76bd0c2ef3d6?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Messenger Bag',
    description: 'Durable canvas messenger bag with leather accents.',
    price: 110,
    stock: 15,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Classic Watch',
    description: 'Minimalist classic watch with a leather strap.',
    price: 150,
    stock: 25,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Silver Cuff Bracelet',
    description: 'Elegant sterling silver cuff bracelet.',
    price: 95,
    stock: 18,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Chukka Boots',
    description: 'Versatile suede chukka boots for everyday wear.',
    price: 125,
    stock: 30,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'High-Top Sneakers',
    description: 'Retro-inspired high-top sneakers in crisp white.',
    price: 95,
    stock: 45,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Suede Desert Boots',
    description: 'Classic desert boots featuring a crepe sole.',
    price: 115,
    stock: 20,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Derby Shoes',
    description: 'Polished leather derby shoes for formal occasions.',
    price: 160,
    stock: 15,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1614252339474-12ec28b4c029?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Slip-on Canvas Shoes',
    description: 'Casual slip-on canvas shoes for easy weekend style.',
    price: 55,
    stock: 50,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&auto=format&fit=crop&q=60'
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
