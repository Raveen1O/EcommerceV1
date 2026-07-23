import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Shipping
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  
  // Payment
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [shippingMethod, setShippingMethod] = useState('standard');
  
  const order = location.state?.order || null;

  const handlePayment = async () => {
    if (!order) {
      setMessage('No order to process. Please return to cart and try again.');
      return;
    }

    if (!email || !firstName || !lastName || !cardNumber || !expiry || !cvc) {
      setMessage('Please complete all payment fields before continuing.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/payments', {
        orderId: order._id,
        fullName: `${firstName} ${lastName}`,
        email,
        cardNumber,
        expiry,
        cvc
      });
      setMessage(`Payment successful! A confirmation email will be sent to ${email}.`);
      setTimeout(() => navigate('/order-status', { state: { orderId: order._id, email } }), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = order?.totalPrice || 0;
  const shippingCost = shippingMethod === 'standard' ? 0 : 25;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  return (
    <div className="product-page">
      <div className="breadcrumb" style={{marginBottom:'32px'}}>Home / Secure Checkout</div>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{fontSize:'32px', fontWeight:400, marginBottom:'8px'}}>Secure Checkout</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize:'14px' }}>Complete your order with peace of mind. All transactions are encrypted.</p>
      </div>

      <div className="checkout-layout">
        <div className="checkout-forms">
          {message && (
            <div className={message.includes('successful') ? 'success-message' : 'error'} style={{ marginBottom: '20px' }}>
              {message}
            </div>
          )}

          <div className="checkout-section">
             <h3>1. Shipping Address</h3>
             <div className="form-grid">
                <input type="email" placeholder="Email address" className="input" value={email} onChange={e=>setEmail(e.target.value)} style={{gridColumn:'1 / -1'}} />
                <input type="text" placeholder="First Name" className="input" value={firstName} onChange={e=>setFirstName(e.target.value)} />
                <input type="text" placeholder="Last Name" className="input" value={lastName} onChange={e=>setLastName(e.target.value)} />
                <input type="text" placeholder="Address" className="input" value={address} onChange={e=>setAddress(e.target.value)} style={{gridColumn:'1 / -1'}} />
                <input type="text" placeholder="City" className="input" value={city} onChange={e=>setCity(e.target.value)} />
                <div style={{display:'flex', gap:'16px'}}>
                  <input type="text" placeholder="State" className="input" value={state} onChange={e=>setState(e.target.value)} />
                  <input type="text" placeholder="ZIP" className="input" value={zip} onChange={e=>setZip(e.target.value)} />
                </div>
             </div>
          </div>

          <div className="checkout-section">
             <h3>2. Shipping Method</h3>
             <div>
                <div className={`shipping-method ${shippingMethod==='standard'?'active':''}`} onClick={()=>setShippingMethod('standard')}>
                   <div>
                      <div className="sm-title">Standard Courier</div>
                      <div className="sm-desc">3-5 business days</div>
                   </div>
                   <div className="sm-price">Free</div>
                </div>
                <div className={`shipping-method ${shippingMethod==='express'?'active':''}`} onClick={()=>setShippingMethod('express')}>
                   <div>
                      <div className="sm-title">Express Delivery</div>
                      <div className="sm-desc">Next day delivery if ordered before 2 PM</div>
                   </div>
                   <div className="sm-price">$25.00</div>
                </div>
             </div>
          </div>

          <div className="checkout-section">
             <h3>3. Payment Details</h3>
             <div className="payment-methods">
               <button className={`pm-btn ${paymentMethod==='credit'?'active':''}`} onClick={()=>setPaymentMethod('credit')}>CREDIT CARD</button>
               <button className={`pm-btn ${paymentMethod==='paypal'?'active':''}`} onClick={()=>setPaymentMethod('paypal')}>PAYPAL</button>
             </div>
             
             {paymentMethod === 'credit' && (
               <div className="form-grid">
                  <input type="text" placeholder="Card number" className="input" value={cardNumber} onChange={e=>setCardNumber(e.target.value)} style={{gridColumn:'1 / -1'}} />
                  <input type="text" placeholder="Name on card" className="input" style={{gridColumn:'1 / -1'}} />
                  <input type="text" placeholder="MM / YY" className="input" value={expiry} onChange={e=>setExpiry(e.target.value)} />
                  <input type="text" placeholder="CVC" className="input" value={cvc} onChange={e=>setCvc(e.target.value)} />
               </div>
             )}
             
             <div style={{marginTop:'16px', fontSize:'13px', color:'var(--text-secondary)'}}>
               <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}}>
                 <input type="checkbox" />
                 Save card information for future purchases
               </label>
             </div>
          </div>

          <button className="checkout-btn" onClick={handlePayment} disabled={loading}>
            {loading ? 'PROCESSING...' : 'PLACE ORDER NOW'}
          </button>
        </div>

        <div>
           <div className="order-summary" style={{position:'sticky', top:'100px'}}>
             <h3>Order Summary</h3>
             <div style={{display:'flex', gap:'16px', marginBottom:'24px', paddingBottom:'24px', borderBottom:'1px solid var(--border)'}}>
                <div style={{width:'80px', height:'100px', background:'var(--bg-secondary)'}}></div>
                <div style={{flex:1, fontSize:'13px'}}>
                   <div style={{fontWeight:600, marginBottom:'4px'}}>Midnight Cashmere Overcoat</div>
                   <div style={{color:'var(--text-secondary)'}}>Size: M | Color: Midnight</div>
                   <div style={{display:'flex', justifyContent:'space-between', marginTop:'16px'}}>
                      <span>Qty: 1</span>
                      <span style={{fontWeight:600}}>${subtotal.toFixed(2)}</span>
                   </div>
                </div>
             </div>
             
             <div className="summary-row">
               <span>Subtotal</span>
               <span>${subtotal.toFixed(2)}</span>
             </div>
             <div className="summary-row">
               <span>Shipping</span>
               <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
             </div>
             <div className="summary-row">
               <span>Estimated Tax</span>
               <span>${tax.toFixed(2)}</span>
             </div>
             <div className="summary-row total">
               <span>Total</span>
               <span>${total.toFixed(2)}</span>
             </div>
             
             <div style={{marginTop:'32px', fontSize:'12px', color:'var(--text-secondary)'}}>
                <p style={{marginBottom:'8px'}}>14-day returns included with all orders.</p>
                <p>Free returns extended for online store orders. Visit our returns page for more info.</p>
             </div>
           </div>
        </div>
      </div>
      
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
