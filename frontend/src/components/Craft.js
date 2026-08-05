import React from 'react';

export default function Craft() {
  return (
    <div className="product-page">
      <div className="container" style={{ padding: '80px 48px', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 400, marginBottom: '24px' }}>Our Craft</h1>
        <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          At LUMINA, we believe clothing should be an extension of the self. Each piece is a result of obsessive precision—balancing the soft curves of the human form with the sharp lines of modern architecture.
        </p>
        <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)', marginTop: '16px' }}>
          We meticulously source premium materials and work with expert artisans to create pieces that are not only beautiful but enduring. Our design philosophy is a dialogue between utility and luxury.
        </p>
      </div>
    </div>
  );
}
