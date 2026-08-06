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
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 15;

  const searchQuery = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || '';

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setProducts([]);
  }, [searchQuery, rawCategory, sortParam]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (rawCategory && rawCategory !== 'All') params.append('category', rawCategory);
    if (sortParam) params.append('sort', sortParam);
    
    const isAllProducts = (!rawCategory || rawCategory === 'All') && !searchQuery;
    
    if (isAllProducts) {
      params.append('page', page);
      params.append('limit', limit);
    }
    
    api.get(`/api/products?${params.toString()}`)
      .then(res => {
        if (isAllProducts && res.data && res.data.products) {
          if (page === 1) {
            setProducts(res.data.products);
          } else {
            setProducts(prev => [...prev, ...res.data.products]);
          }
          setHasMore(res.data.hasMore);
        } else {
          setProducts(res.data || []);
          setHasMore(false);
        }
      })
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false));
  }, [searchQuery, rawCategory, sortParam, page]);

  const handleCategory = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat.toLowerCase());
    }
    setSearchParams(params);
  };

  const handleSort = (e) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set('sort', e.target.value);
    } else {
      params.delete('sort');
    }
    setSearchParams(params);
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
            {loading ? '...' : `${products.length} pieces`}
            <select value={sortParam} onChange={handleSort} style={{ marginLeft: '16px', padding: '4px 8px' }}>
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="alpha-asc">Alphabetical: A-Z</option>
              <option value="alpha-desc">Alphabetical: Z-A</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading && page === 1 ? (
          <div className="center" style={{ minHeight: '40vh' }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="error-text" style={{ padding: '40px 0' }}>{error}</div>
        ) : (
          <>
            <div className="listing-grid">
              {products.length === 0 ? (
                <div style={{ padding: '40px 0', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No products found in this category.
                </div>
              ) : (
                products.map(product => {
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
            
            {hasMore && (
              <div className="center" style={{ marginTop: '60px', marginBottom: '20px' }}>
                <button 
                  className="btn-explore" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                >
                  {loading ? 'LOADING...' : 'LOAD MORE'}
                </button>
              </div>
            )}
          </>
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
