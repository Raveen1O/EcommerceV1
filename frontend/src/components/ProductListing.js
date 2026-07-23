import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { getProductImage } from '../services/productImage';

const CATEGORIES = ['All', 'Outerwear', 'Knitwear', 'Accessories', 'Footwear'];

const categoryMap = {
  outerwear: 'Outerwear',
  knitwear:  'Knitwear',
  accessories: 'Accessories',
  footwear: 'Footwear',
};

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategory = searchParams.get('category') || 'All';
  const activeCategory = categoryMap[rawCategory.toLowerCase()] || rawCategory;

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/api/products')
      .then(res => setProducts(res.data || []))
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false));
  }, []);

  const searchQuery = searchParams.get('search') || '';

  /* Client-side filter by category query param and search */
  let filtered = activeCategory === 'All'
    ? products
    : products.filter(p => {
        const cat = (p.category || '').toLowerCase();
        return cat === activeCategory.toLowerCase();
      });
      
  if (searchQuery) {
    filtered = filtered.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  const handleCategory = (cat) => {
    if (cat === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat.toLowerCase() });
    }
  };

  return (
    <div className="product-listing-page">
      {/* Breadcrumb */}
      <div className="container">
        <div className="breadcrumb" style={{ marginBottom: 0, paddingTop: '24px' }}>
          <Link to="/">Home</Link> / <span>{searchQuery ? 'Search' : (activeCategory === 'All' ? 'All Collections' : activeCategory)}</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="listing-header">
        <div className="listing-header-inner">
          <div className="listing-label">LUMINA COLLECTIONS</div>
          <h1 className="listing-title">
            {searchQuery ? `Search Results: "${searchQuery}"` : (activeCategory === 'All' ? 'All Collections' : activeCategory)}
          </h1>
          <p className="listing-subtitle">
            Architectural precision. Timeless silhouette.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Category Filter Pills */}
        <div className="listing-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-pill ${activeCategory === cat || (cat === 'All' && activeCategory === 'All') ? 'active' : ''}`}
              onClick={() => handleCategory(cat)}
            >
              {cat}
            </button>
          ))}
          <div className="filter-count">
            {loading ? '...' : `${filtered.length} pieces`}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="center" style={{ minHeight: '40vh' }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="error-text" style={{ padding: '40px 0' }}>{error}</div>
        ) : (
          <div className="listing-grid">
            {filtered.length === 0 ? (
              /* Empty state with placeholders */
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="listing-card skeleton-card">
                  <div className="listing-card-img skeleton-img" />
                  <div className="listing-card-info">
                    <div className="skeleton-line" style={{ width: '70%' }} />
                    <div className="skeleton-line" style={{ width: '40%', marginTop: '8px' }} />
                  </div>
                </div>
              ))
            ) : (
              filtered.map(product => {
                const imageUrl = getProductImage(product);
                return (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className="listing-card"
                  >
                    <div className="listing-card-img">
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.name} />
                      ) : (
                        <div className="img-placeholder" />
                      )}
                      <div className="listing-card-hover-overlay">
                        <span>VIEW PRODUCT</span>
                      </div>
                    </div>
                    <div className="listing-card-info">
                      <div className="listing-card-category">
                        {product.category || 'LUMINA'}
                      </div>
                      <div className="listing-card-name">{product.name}</div>
                      <div className="listing-card-price">
                        ${product.price?.toFixed(2)}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer" style={{ marginTop: '80px' }}>
        <div className="footer-cols container">
          <div className="footer-col brand-col">
            <h3>LUMINA</h3>
            <p>Curating the intersection of timeless minimalism and contemporary silhouette.</p>
          </div>
          <div className="footer-col">
            <h4>EXPLORE</h4>
            <Link to="/products">All Collections</Link>
            <Link to="/products?category=outerwear">Outerwear</Link>
            <Link to="/products?category=knitwear">Knitwear</Link>
          </div>
          <div className="footer-col">
            <h4>ASSISTANCE</h4>
            <a href="#">Shipping &amp; Returns</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
