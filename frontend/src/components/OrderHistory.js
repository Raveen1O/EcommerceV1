import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getUserId, isLoggedIn } from '../services/auth';
import { getProductImage } from '../services/productImage';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      setError('Please log in to view your order history.');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const userId = getUserId();
        const ordersRes = await api.get(`/api/orders/user/${userId}`);
        const prodRes = await api.get('/api/products');

        const productsMap = {};
        if (prodRes.data) {
          prodRes.data.forEach(p => {
            productsMap[p._id] = p;
          });
        }

        setOrders(ordersRes.data || []);
        setProducts(productsMap);
      } catch (err) {
        setError('Failed to fetch order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
          <Link to="/">Home</Link> / <span>Order History</span>
        </div>
        <h1 style={{ marginBottom: '40px', fontSize: '36px', fontWeight: 400 }}>Your Orders</h1>

        {orders.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>You have no previous orders.</p>
            <Link to="/products" className="btn-add" style={{ maxWidth: '200px', display: 'inline-block', textDecoration: 'none', textAlign: 'center', marginTop: '24px' }}>SHOP NOW</Link>
          </div>
        ) : (
          <div className="orders-list">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eaeaea', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '16px' }}>Order ID</th>
                  <th style={{ padding: '16px' }}>Date</th>
                  <th style={{ padding: '16px' }}>Total</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const date = new Date(order.createdAt).toLocaleDateString();
                  return (
                    <tr key={order._id} style={{ borderBottom: '1px solid #eaeaea' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{order._id.slice(-8).toUpperCase()}</td>
                      <td style={{ padding: '16px' }}>{date}</td>
                      <td style={{ padding: '16px' }}>${order.totalPrice?.toFixed(2)}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                          backgroundColor: order.status === 'Pending' ? '#fff3cd' : '#d1e7dd',
                          color: order.status === 'Pending' ? '#856404' : '#0f5132'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button onClick={() => setSelectedOrder(order)} style={{ background: 'none', border: 'none', color: 'black', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', width: '90%', maxWidth: '600px', borderRadius: '4px', padding: '32px', position: 'relative'
          }}>
            <button
              onClick={() => setSelectedOrder(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
            >
              ×
            </button>
            <h2 style={{ marginBottom: '8px' }}>Order Details</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Order ID: {selectedOrder._id} <br />
              Placed on: {new Date(selectedOrder.createdAt).toLocaleString()}
            </p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', borderTop: '1px solid #eaeaea', paddingTop: '24px' }}>
              {(() => {
                const product = products[selectedOrder.productId] || { name: 'Unknown Product', price: 0 };
                const imageUrl = getProductImage(product);
                return (
                  <>
                    <div style={{ width: '100px', flexShrink: 0 }}>
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.name} style={{ width: '100%', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: '100px', height: '120px', background: 'var(--bg-secondary)', borderRadius: '4px' }}></div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 8px 0' }}>{product.name}</h4>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Quantity: {selectedOrder.quantity}</p>
                      <p style={{ margin: 0, fontWeight: 600 }}>${(product.price * selectedOrder.quantity).toFixed(2)}</p>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <div style={{ borderTop: '1px solid #eaeaea', marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '18px' }}>
              <span>Total</span>
              <span>${selectedOrder.totalPrice?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
