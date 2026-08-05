import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { isLoggedIn, getEmail } from '../services/auth';

export default function Header(){
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check auth status
    const checkAuth = async () => {
      try {
        const logged = isLoggedIn();
        setLoggedIn(logged);
        if (logged) {
          const email = getEmail();
          if (email) {
            setUserName(email.split('@')[0]);
          }
          fetchCartCount();
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };
    checkAuth();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      if (isLoggedIn()) fetchCartCount();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      const { getUserId } = require('../services/auth');
      const api = require('../services/api').default;
      const userId = getUserId();
      if (userId) {
        const res = await api.get(`/api/cart/user/${userId}`);
        const count = (res.data || []).reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      }
    } catch (err) {
      console.error("Failed to fetch cart count", err);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (search.trim()) {
        navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      } else {
        navigate(`/products`);
      }
      setSearch('');
    }
  };

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      setLoggedIn(false);
      setDropdownOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const toggleDropdown = (e) => {
    if (loggedIn) {
      e.preventDefault();
      setDropdownOpen(!dropdownOpen);
    }
  };

  return (
    <header className="header">
      <div className="brand">
        <Link to="/">LUMINA</Link>
      </div>
      <nav className="main-nav">
        <Link to="/products">New Arrivals</Link>
        <Link to="/products?category=outerwear">Outerwear</Link>
        <Link to="/products?category=knitwear">Knitwear</Link>
        <Link to="/products?category=accessories">Accessories</Link>
      </nav>
      <div className="header-actions">
        <div className="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
        
        {loggedIn && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginRight: '16px' }}>
            <Link to="/orders" style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textDecoration: 'none', color: 'var(--black, black)' }}>
              ORDERS
            </Link>
            <Link to="/wishlist" style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textDecoration: 'none', color: 'var(--black, black)' }}>
              WISHLIST
            </Link>
          </div>
        )}
        <div className="user-menu-container" ref={dropdownRef} style={{ position: 'relative' }}>
          <Link to={loggedIn ? "#" : "/login"} className="icon-link" onClick={toggleDropdown}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </Link>
          
          {loggedIn && dropdownOpen && (
            <div className="user-dropdown" style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '8px',
              background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px',
              padding: '16px', minWidth: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 1000
            }}>
              <div style={{ fontWeight: '600', marginBottom: '16px', fontSize: '14px', textTransform: 'capitalize' }}>
                Hello, {userName}
              </div>

              <button 
                onClick={handleSignOut}
                style={{
                  width: '100%', padding: '8px', background: 'var(--black)',
                  color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px',
                  fontSize: '12px', fontWeight: '600', letterSpacing: '1px'
                }}
              >
                SIGN OUT
              </button>
            </div>
          )}
        </div>

        <Link to="/cart" className="icon-link" style={{ position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: '-6px', right: '-8px', background: 'var(--black)', color: 'white',
              fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
