import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { getUserId } from '../services/auth';
import { getProductImage } from '../services/productImage';
import ProductCard from './ProductCard';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { key: 'midnight', label: 'Midnight', hex: '#1a1a2e' },
  { key: 'charcoal', label: 'Charcoal', hex: '#3d3d3d' },
  { key: 'camel',    label: 'Camel',    hex: '#c19a6b' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct]     = useState(null);
  const [related, setRelated]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // UI state
  const [selectedSize, setSelectedSize]   = useState('M');
  const [selectedColor, setSelectedColor] = useState('midnight');
  const [quantity, setQuantity]           = useState(1);
  const [descOpen, setDescOpen]           = useState(true);
  const [shipOpen, setShipOpen]           = useState(false);

  // Cart feedback
  const [cartLoading, setCartLoading]   = useState(false);
  const [cartMessage, setCartMessage]   = useState(null); // { type: 'success'|'error', text }

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    Promise.all([
      api.get(`/api/products/${id}`),
      api.get('/api/products'),
    ])
      .then(([prodRes, allRes]) => {
        setProduct(prodRes.data);
        // Pick 4 random products that are NOT the current one for "Complete the Look"
        const others = (allRes.data || []).filter(p => p._id !== id);
        // shuffle & take 4
        const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 4);
        setRelated(shuffled);
      })
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    setCartLoading(true);
    setCartMessage(null);
    const userId = getUserId();

    try {
      await api.post('/api/cart/add', {
        userId,
        productId: product._id,
        quantity,
      });
      window.dispatchEvent(new Event('cartUpdated'));
      setCartMessage({ type: 'success', text: `"${product.name}" has been added to your bag!` });
      // Auto-clear success after 4 seconds
      setTimeout(() => setCartMessage(null), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not add to cart. Please try again.';
      setCartMessage({ type: 'error', text: msg });
      setTimeout(() => setCartMessage(null), 4000);
    } finally {
      setCartLoading(false);
    }
  };

  const addToWishlist = async () => {
    if (!getUserId()) {
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    setWishlistMessage(null);
    try {
      await api.post('/api/wishlist/add', {
        userId: getUserId(),
        productId: product._id
      });
      window.dispatchEvent(new Event('wishlistUpdated'));
      setWishlistMessage({ type: 'success', text: `"${product.name}" added to wishlist!` });
      setTimeout(() => setWishlistMessage(null), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not add to wishlist.';
      setWishlistMessage({ type: 'error', text: msg });
      setTimeout(() => setWishlistMessage(null), 4000);
    } finally {
      setWishlistLoading(false);
    }
  };

  const goToCart = () => navigate('/cart');

  if (loading) {
    return (
      <div className="center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '80px 48px' }}>
        <div className="error-text">{error || 'Product not found.'}</div>
        <Link to="/products" className="learn-more" style={{ marginTop: '24px', display: 'inline-block' }}>
          ← Back to Collections
        </Link>
      </div>
    );
  }

  const imageUrl = getProductImage(product);
  const inStock = product.stock == null || product.stock > 0;
  const stockCount = product.stock ?? null;

  return (
    <div className="product-page">
      {/* Breadcrumb */}
      <div className="container" style={{ paddingBottom: 0 }}>
        <div className="breadcrumb">
          <Link to="/">Home</Link> /{' '}
          <Link to="/products">Collections</Link> /{' '}
          {product.category && (
            <>
              <Link to={`/products?category=${product.category.toLowerCase()}`}>
                {product.category}
              </Link>{' '}
              /{' '}
            </>
          )}
          <span>{product.name}</span>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="container" style={{ paddingTop: '16px' }}>
        <div className="hero-product">
          {/* LEFT — Images */}
          <div className="hero-images">
            <div className="hero-image-main">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} />
              ) : (
                <div className="img-placeholder" style={{ aspectRatio: '4/5' }} />
              )}
            </div>

          </div>

          {/* RIGHT — Details */}
          <div className="hero-details">
            {/* Brand label */}
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              LUMINA {product.category ? `· ${product.category.toUpperCase()}` : ''}
            </div>

            {/* Title */}
            <h1 className="product-title">{product.name}</h1>

            {/* Price */}
            <div className="product-price">${product.price?.toFixed(2)}</div>

            {/* Stock indicator */}
            <div className="pd-stock-row">
              {inStock ? (
                <>
                  <span className="pd-stock-dot in" />
                  <span className="pd-stock-text in">
                    {stockCount !== null ? `In Stock — ${stockCount} remaining` : 'In Stock'}
                  </span>
                </>
              ) : (
                <>
                  <span className="pd-stock-dot out" />
                  <span className="pd-stock-text out">Out of Stock</span>
                </>
              )}
            </div>

            {/* Color selector */}
            <div className="color-selector">
              <div className="opt-label">
                COLOUR — <span style={{ fontWeight: 400, textTransform: 'capitalize' }}>
                  {COLORS.find(c => c.key === selectedColor)?.label}
                </span>
              </div>
              <div className="colors">
                {COLORS.map(c => (
                  <div
                    key={c.key}
                    className={`color ${selectedColor === c.key ? 'active' : ''}`}
                    style={{ background: c.hex }}
                    onClick={() => setSelectedColor(c.key)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div className="size-selector">
              <div className="opt-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>SIZE — {selectedSize}</span>
              </div>
              <div className="sizes">
                {SIZES.map(s => (
                  <div
                    key={s}
                    className={`size ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>



            {/* Cart feedback message */}
            {cartMessage && (
              <div
                className={cartMessage.type === 'success' ? 'pd-success-msg' : 'pd-error-msg'}
                style={{ marginBottom: '16px' }}
              >
                {cartMessage.type === 'success' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                <span>{cartMessage.text}</span>
                {cartMessage.type === 'success' && (
                  <button className="pd-go-cart-btn" onClick={goToCart}>
                    VIEW BAG →
                  </button>
                )}
              </div>
            )}

            {/* Add to Cart */}
            <button
              className="btn-add"
              onClick={addToCart}
              disabled={cartLoading || !inStock}
            >
              {cartLoading ? 'ADDING...' : inStock ? 'ADD TO CART' : 'SOLD OUT'}
            </button>

            {/* Wishlist */}
            <button className="btn-wishlist" onClick={addToWishlist} disabled={wishlistLoading}>
              {wishlistLoading ? 'SAVING...' : 'WISHLIST'}
            </button>
            {wishlistMessage && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: wishlistMessage.type === 'error' ? 'var(--error)' : 'var(--success)' }}>
                {wishlistMessage.text}
              </div>
            )}

            {/* Description accordion */}
            <div className="product-desc-section border-top">
              <div
                className="desc-header flex-between"
                onClick={() => setDescOpen(o => !o)}
              >
                <span>DESCRIPTION</span>
                <span style={{ fontSize: '18px', fontWeight: 300 }}>{descOpen ? '−' : '+'}</span>
              </div>
              {descOpen && (
                <p>
                  {product.description ||
                    'A considered piece for the modern wardrobe. Crafted from premium materials with meticulous attention to detail. The silhouette draws from architectural principles—balancing structure with fluidity for an effortless, elevated look.'}
                </p>
              )}
            </div>

            {/* Shipping accordion */}
            <div className="product-desc-section">
              <div
                className="desc-header flex-between"
                onClick={() => setShipOpen(o => !o)}
              >
                <span>SHIPPING &amp; RETURNS</span>
                <span style={{ fontSize: '18px', fontWeight: 300 }}>{shipOpen ? '−' : '+'}</span>
              </div>
              {shipOpen && (
                <p>
                  Complimentary standard shipping on all orders over $1,000. Express delivery available at checkout.
                  Returns accepted within 14 days of delivery in original condition.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Complete the Look */}
        {related.length > 0 && (
          <div className="complete-the-look">
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              EDITORIAL STYLING
            </div>
            <h2>Complete the Look</h2>
            <p className="subtitle">Recommended pairings selected by our stylists.</p>
            <div className="look-grid">
              {related.map(p => (
                <Link key={p._id} to={`/product/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <ProductCard product={p} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-cols container">
          <div className="footer-col brand-col">
            <h3>LUMINA</h3>
            <p>Redefining luxury through a minimal utility and architectural form.</p>
            <div className="socials">
              <div className="social-icon">IN</div>
              <div className="social-icon">TW</div>
              <div className="social-icon">IG</div>
            </div>
          </div>
          <div className="footer-col">
              <h4>EXPLORE</h4>
              <a href="#">Collections</a>
              <a href="#">New Arrivals</a>
              <a href="/store-locator">Store Locator</a>
           </div>
           <div className="footer-col">
              <h4>ASSISTANCE</h4>
              <a href="/shipping-returns">Shipping &amp; Returns</a>
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/terms-of-service">Terms of Service</a>
           </div>
        </div>
      </footer>
    </div>
  );
}
