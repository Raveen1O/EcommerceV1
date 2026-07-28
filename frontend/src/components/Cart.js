import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getUserId, getUsername, getEmail } from '../services/auth';
import { getProductImage } from '../services/productImage';
import ProductCard from './ProductCard';

export default function Cart(){
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const { isLoggedIn } = require('../services/auth');


  const loadCart = async ()=>{
    setLoading(true);
    const userId = getUserId();

    if (!isLoggedIn()) {
      setLoading(false);
      return; // Do not attempt to load backend cart for guests
    }

    try{
      const cartRes = await api.get(`/api/cart/user/${userId}`);
      const prodRes = await api.get(`/api/products`);
      
      const productsMap = {};
      if (prodRes.data) {
        setAllProducts(prodRes.data);
        prodRes.data.forEach(p => {
          productsMap[p._id] = p;
        });
      }
      
      setItems(cartRes.data || []);
      setProducts(productsMap);
    }catch(err){
      console.error(err);
      setMessage('Failed to load cart data');
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{ loadCart(); },[]);

  const removeItem = async (cartItemId)=>{
    try{
      await api.delete(`/api/cart/${cartItemId}`);
      setItems(items.filter(i=> i._id !== cartItemId));
      window.dispatchEvent(new Event('cartUpdated'));
    }catch(err){
      setMessage('Failed to remove item');
    }
  };

  const checkout = async () => {
    setLoading(true);
    const username = getUsername() || 'guest';
    const email    = getEmail()    || '';
    try {
        const res = await api.post(`/api/cart/checkout/${username}`, { email });
        navigate("/payment", { state: { order: res.data.order } });
    } catch (err) {
        setMessage(err.response?.data?.message || "Checkout failed");
    } finally {
        setLoading(false);
        setTimeout(() => setMessage(null), 3000);
    }
  };

  const increase = async (productId)=>{
    const userId = getUserId();
    try{
      await api.post('/api/cart/add', { userId, productId });
      setItems(prev=>prev.map(p=>p.productId===productId ? {...p, quantity: p.quantity+1} : p));
      window.dispatchEvent(new Event('cartUpdated'));
    }catch(err){
      setMessage('Failed to increase quantity');
      setTimeout(()=>setMessage(null),2000);
    }
  };

  const decrease = async (productId)=>{
    const userId = getUserId();
    try{
      const res = await api.patch('/api/cart/decrease', { userId, productId });
      const updated = res.data;
      setItems(prev=>prev.map(p=>p.productId===productId ? {...p, quantity: updated.quantity} : p).filter(p=>p.quantity>0));
      window.dispatchEvent(new Event('cartUpdated'));
    }catch(err){
      setMessage('Failed to decrease quantity');
      setTimeout(()=>setMessage(null),2000);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, it) => {
      const prod = products[it.productId];
      return acc + (prod ? prod.price * it.quantity : 0);
    }, 0);
  };
  
  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const others = allProducts.slice(0, 4);

  if(loading) return <div className="center" style={{minHeight:'60vh'}}><div className="spinner"></div></div>;

  return (
    <div className="product-page">
      <div className="breadcrumb" style={{marginBottom:'32px'}}>Home / Your Bag</div>
      
      {message && <div className="toast">{message}</div>}

      <div className="cart-layout">
        <div>
           <h1 style={{marginBottom:'40px', fontSize:'36px', fontWeight:400}}>Your Bag</h1>
           
           {items.length === 0 ? (
             <div style={{padding:'40px 0', textAlign: 'center'}}>
                <div style={{ margin: '0 auto 24px', width: '80px', height: '80px', opacity: 0.3 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                </div>
                <p style={{color:'var(--text-secondary)', marginBottom: '32px'}}>Your bag is currently empty.</p>
                <button className="btn-add" style={{ maxWidth: '200px' }} onClick={() => navigate('/products')}>CONTINUE SHOPPING</button>
             </div>
           ) : (
             <div>
                {items.map(it=> {
                  const detail = products[it.productId] || { name: 'Unknown Product', price: 0 };
                  const imageUrl = getProductImage(detail);
                  return (
                    <div key={it._id} className="cart-item">
                      <div className="cart-item-img">
                        {imageUrl ? (
                          <img src={imageUrl} alt={detail.name} />
                        ) : (
                          <div style={{width:'100%', aspectRatio:'3/4', background:'var(--bg-secondary)'}}></div>
                        )}
                      </div>
                      <div className="cart-item-details">
                        <div>
                           <div className="flex-between" style={{alignItems:'flex-start'}}>
                              <div>
                                 <div className="cart-item-title">{detail.name}</div>
                                 <div className="cart-item-desc">Pharmacy Green</div>
                              </div>
                              <div style={{fontWeight:600}}>${detail.price?.toFixed(2)}</div>
                           </div>
                        </div>
                        <div className="cart-item-actions">
                          <div className="qty-control">
                            <button className="qty-btn" onClick={()=>decrease(it.productId)}>-</button>
                            <span className="qty-val">{it.quantity}</span>
                            <button className="qty-btn" onClick={()=>increase(it.productId)}>+</button>
                          </div>
                          <button className="btn-remove" onClick={()=>removeItem(it._id)}>Remove</button>
                        </div>
                        <div style={{fontSize:'12px', color:'var(--success)', marginTop:'8px', display:'flex', alignItems:'center', gap:'4px'}}>
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                           In stock and ready to ship
                        </div>
                      </div>
                    </div>
                  );
                })}
             </div>
           )}
        </div>

        <div>
           {items.length > 0 && (
             <div className="order-summary">
               <h3>Order Summary</h3>
               <div className="summary-row">
                 <span>Subtotal</span>
                 <span>${subtotal.toFixed(2)}</span>
               </div>
               <div className="summary-row">
                 <span>Shipping</span>
                 <span>Calculated at next step</span>
               </div>
               <div className="summary-row">
                 <span>Estimated Tax</span>
                 <span>${tax.toFixed(2)}</span>
               </div>
               <div className="summary-row total">
                 <span>Total</span>
                 <span>${total.toFixed(2)}</span>
               </div>
               
               <button className="checkout-btn" onClick={checkout}>PROCEED TO PAY</button>
               
               <div style={{marginTop:'24px', display:'flex', flexDirection:'column', gap:'16px'}}>
                 <div style={{display:'flex', gap:'12px', fontSize:'12px', color:'var(--text-secondary)'}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <span>Secure Checkout.<br/>256-bit encrypted payment gateway.</span>
                 </div>
                 <div style={{display:'flex', gap:'12px', fontSize:'12px', color:'var(--text-secondary)'}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                    <span>Free standard shipping<br/>On all orders above $1,000.</span>
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>

      {others.length > 0 && (
        <div className="complete-the-look">
           <h2>Complete the Look</h2>
           <div className="look-grid">
              {others.map(p=> <ProductCard key={p._id} product={p} />)}
           </div>
        </div>
      )}

      <footer className="footer">
         <div className="footer-cols">
           <div className="footer-col brand-col">
             <h3>LUMINA</h3>
             <p>Redefining luxury through a minimal utility and architectural form. Join our circle for early access to accessories and collection previews.</p>
             <div className="socials">
                <div className="social-icon">IN</div>
                <div className="social-icon">TW</div>
                <div className="social-icon">IG</div>
             </div>
           </div>
           <div className="footer-col">
              <h4>SUPPORT</h4>
              <a href="#">Contact Us</a>
              <a href="#">Shipping & Returns</a>
              <a href="#">Store Locator</a>
           </div>
           <div className="footer-col">
              <h4>LEGAL</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
           </div>
         </div>
      </footer>
    </div>
  );
}
