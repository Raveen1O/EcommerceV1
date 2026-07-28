import React from 'react';
import { getProductImage } from '../services/productImage';

export default function ProductCard({product}){
  const imageUrl = getProductImage(product);
  const inStock = product.stock == null || product.stock > 0;
  
  return (
    <div className="minimal-card">
      <div className="minimal-card-img">
         {imageUrl ? (
           <img src={imageUrl} alt={product.name} />
         ) : (
           <div style={{width:'100%', aspectRatio:'3/4', background:'var(--bg-secondary)', marginBottom:'16px'}}></div>
         )}
         {!inStock && (
           <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'black', color: 'white', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold' }}>
             SOLD OUT
           </div>
         )}
      </div>
      <div className="minimal-card-info">
         <div className="minimal-card-top flex-between">
           <span className="product-name">{product.name}</span>
         </div>
         <div className="minimal-card-bottom">
           <span className="product-price">${product.price?.toFixed(2)}</span>
         </div>
      </div>
    </div>
  );
}
