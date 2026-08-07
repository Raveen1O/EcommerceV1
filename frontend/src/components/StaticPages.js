import React from 'react';

export function StoreLocator() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1>Store Locator</h1>
      <p>Find a store near you. We have multiple locations worldwide!</p>
      <div style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
        <h3>New York Flagship</h3>
        <p>123 Fashion Ave, New York, NY 10001</p>
        <p>Hours: Mon-Sat 10am - 8pm, Sun 11am - 6pm</p>
      </div>
      <div style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
        <h3>London Boutique</h3>
        <p>45 Oxford St, London W1D 1DZ, UK</p>
        <p>Hours: Mon-Sat 9am - 9pm, Sun 12pm - 6pm</p>
      </div>
    </div>
  );
}

export function ShippingReturns() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1>Shipping & Returns</h1>
      <h2>Shipping</h2>
      <p>We offer free standard shipping on all orders over $100. Standard shipping typically takes 3-5 business days. Expedited shipping is available at checkout for an additional fee.</p>
      
      <h2 style={{ marginTop: '30px' }}>Returns</h2>
      <p>If you're not completely satisfied with your purchase, you may return it within 30 days of receipt. Items must be unworn, unwashed, and have original tags attached.</p>
      <p>To initiate a return, please contact our support team or use the return portal in your account dashboard.</p>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1>Privacy Policy</h1>
      <p>Your privacy is important to us. This Privacy Policy explains how we collect, use, and share your personal information when you visit or make a purchase from our store.</p>
      
      <h3 style={{ marginTop: '20px' }}>Information We Collect</h3>
      <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact support. This includes your name, email, shipping address, and payment information.</p>
      
      <h3 style={{ marginTop: '20px' }}>How We Use Information</h3>
      <p>We use your information to fulfill orders, process payments, and communicate with you about your account and promotions.</p>
    </div>
  );
}

export function TermsOfService() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1>Terms of Service</h1>
      <p>Welcome to our store. By accessing or using our website, you agree to be bound by these Terms of Service.</p>
      
      <h3 style={{ marginTop: '20px' }}>Use of Our Site</h3>
      <p>You may not use our products for any illegal or unauthorized purpose. You must not transmit any worms, viruses, or destructive code.</p>
      
      <h3 style={{ marginTop: '20px' }}>Accuracy of Information</h3>
      <p>We are not responsible if information made available on this site is not accurate, complete, or current. The material on this site is provided for general information only.</p>
    </div>
  );
}
