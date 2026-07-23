import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const STEPS = [
  { id: 'placed', label: 'Order Placed' },
  { id: 'processed', label: 'Processed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' }
];

export default function OrderStatus() {
  const location = useLocation();
  const orderId = location.state?.orderId || 'ORD-89241-TEST';
  const email = location.state?.email || 'customer@example.com';
  
  // 0 = Placed, 1 = Processed, 2 = Shipped, 3 = Delivered
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const simulateNext = () => {
    setCurrentStepIndex(prev => (prev < STEPS.length - 1 ? prev + 1 : 0));
  };

  // Calculate the width of the active line based on current step
  const progressPercentage = (currentStepIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="order-status-page">
      <div className="os-header">
        <h1>Thank you for your order.</h1>
        <p>Order #{orderId} • Confirmation sent to {email}</p>
      </div>

      <div className="timeline-container">
        {/* Background line */}
        <div className="timeline-line-bg" />
        
        {/* Active progress line */}
        <div 
          className="timeline-line-active" 
          style={{ width: `calc(${progressPercentage}% - 120px)` }} 
        />

        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          
          let statusClass = '';
          if (isCompleted) statusClass = 'completed';
          else if (isActive) statusClass = 'active';

          return (
            <div key={step.id} className={`timeline-step ${statusClass}`}>
              <div className="timeline-label-top">{step.label}</div>
              <div className="timeline-circle">
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : isActive ? (
                  <div style={{width: 8, height: 8, background: 'var(--black)', borderRadius: '50%'}} />
                ) : null}
              </div>
              <div className="timeline-label-bottom">
                {isActive && index === 0 && 'We have received your order.'}
                {isActive && index === 1 && 'Packing your items.'}
                {isActive && index === 2 && 'In transit with courier.'}
                {isActive && index === 3 && 'Package delivered.'}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '60px' }}>
        <Link to="/" className="btn-add" style={{ display: 'inline-block', maxWidth: '300px' }}>
          CONTINUE SHOPPING
        </Link>
      </div>

      {/* Demo Panel for Reviewer */}
      <div className="os-demo-panel">
        <h4>Demo Controls</h4>
        <p style={{fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12}}>
          Use this button to quickly simulate the shipping progression without a real backend webhook.
        </p>
        <button className="os-demo-btn" onClick={simulateNext}>
          SIMULATE NEXT STEP
        </button>
      </div>
    </div>
  );
}
