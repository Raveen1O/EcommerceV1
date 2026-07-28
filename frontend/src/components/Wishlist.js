import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getUserId, isLoggedIn } from '../services/auth';
import ProductCard from './ProductCard';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    if (!isLoggedIn()) {
      setError('Please log in to view your wishlist.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const userId = getUserId();
      const wishRes = await api.get(`/api/wishlist/user/${userId}`);
      const prodRes = await api.get('/api/products');

      const productsMap = {};
      if (prodRes.data) {
        prodRes.data.forEach(p => {
          productsMap[p._id] = p;
        });
      }

      setItems(wishRes.data || []);
      setProducts(productsMap);
    } catch (err) {
      setError('Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
    window.addEventListener('wishlistUpdated', fetchWishlist);
    return () => window.removeEventListener('wishlistUpdated', fetchWishlist);
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      const userId = getUserId();
      await api.delete(`/api/wishlist/${userId}/${productId}`);
      setItems(items.filter(i => i.productId !== productId));
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
      console.error(err);
    }
  };

  const moveToCart = async (productId) => {
    try {
      const userId = getUserId();
      await api.post('/api/cart/add', { userId, productId, quantity: 1 });
      window.dispatchEvent(new Event('cartUpdated'));
      await removeFromWishlist(productId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="center" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="container" style={{ padding: '80px 0' }}><div className="error-text">{error}</div></div>;
  }

  return (
    <div className="product-page">
      <div className="container">
        <div className="breadcrumb" style={{ paddingTop: '24px', marginBottom: '24px' }}>
          <Link to="/">Home</Link> / <span>Wishlist</span>
        </div>
        <h1 style={{ marginBottom: '40px', fontSize: '36px', fontWeight: 400 }}>Your Wishlist</h1>

        {items.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ margin: '0 auto 24px', width: '80px', height: '80px', opacity: 0.3 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Your wishlist is empty.</p>
            <Link to="/products" className="btn-add" style={{ maxWidth: '200px', display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>EXPLORE COLLECTION</Link>
          </div>
        ) : (
          <div className="listing-grid">
            {items.map(item => {
              const product = products[item.productId];
              if (!product) return null;
              
              return (
                <div key={item._id} style={{ position: 'relative' }}>
                  <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <ProductCard product={product} />
                  </Link>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button className="btn-add" style={{ flex: 1, padding: '8px', fontSize: '10px' }} onClick={() => moveToCart(product._id)}>MOVE TO BAG</button>
                    <button className="btn-remove" style={{ flex: 1, padding: '8px', fontSize: '10px', background: '#f5f5f5', color: 'black' }} onClick={() => removeFromWishlist(product._id)}>REMOVE</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
