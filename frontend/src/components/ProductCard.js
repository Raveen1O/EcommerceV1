import React from 'react';
import { getProductImage } from '../services/productImage';

export default function ProductCard({product}){
  const imageUrl = getProductImage(product);
  
  return (
    <div className="minimal-card">
      <div className="minimal-card-img">
         {imageUrl ? (
           <img src={imageUrl} alt={product.name} />
         ) : (
           <div style={{width:'100%', aspectRatio:'3/4', background:'var(--bg-secondary)', marginBottom:'16px'}}></div>
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
