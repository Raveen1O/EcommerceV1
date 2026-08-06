import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getProductImage } from '../services/productImage';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Edit / Create State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [imageFile, setImageFile] = useState(null);
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    category: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, analyticsRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/orders').catch(e => ({ data: [] })),
        api.get('/api/orders/analytics').catch(e => ({ data: null }))
      ]);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setAnalytics(analyticsRes.data || null);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  const filteredOrders = orders.filter(o => 
    o._id?.toLowerCase().includes(orderSearchQuery.toLowerCase()) || 
    o.userId?.toLowerCase().includes(orderSearchQuery.toLowerCase())
  );

  const handleOpenModal = (mode, product = null) => {
    setModalMode(mode);
    setImageFile(null);
    if (mode === 'edit' && product) {
      setCurrentProduct({
        _id: product._id,
        name: product.name || '',
        category: product.category || '',
        description: product.description || '',
        price: product.price || 0,
        stock: product.stock || 0,
        imageUrl: product.imageUrl || product.image || ''
      });
    } else {
      setCurrentProduct({
        name: '',
        category: '',
        description: '',
        price: 0,
        stock: 0,
        imageUrl: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentProduct(null);
    setImageFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = currentProduct.imageUrl;

      if (imageFile) {
        // Request presigned URL
        const urlRes = await api.get(`/api/products/upload-url?filename=${encodeURIComponent(imageFile.name)}&contentType=${encodeURIComponent(imageFile.type)}`);
        const { uploadUrl, publicUrl } = urlRes.data;
        
        // Upload to S3 directly
        await fetch(uploadUrl, {
          method: 'PUT',
          body: imageFile,
          headers: {
            'Content-Type': imageFile.type
          }
        });
        
        finalImageUrl = publicUrl;
      }

      const productPayload = { ...currentProduct, imageUrl: finalImageUrl };

      if (modalMode === 'create') {
        await api.post('/api/products', productPayload);
      } else {
        const { _id, ...updateData } = productPayload;
        await api.put(`/api/products/${_id}`, updateData);
      }
      handleCloseModal();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            Analytics
          </li>
          <li className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
            Products
          </li>
          <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
            Orders
          </li>
        </ul>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="admin-tab-content">
            <h2>Analytics Dashboard</h2>
            {analytics ? (
              <>
                <div className="analytics-cards">
                  <div className="analytics-card">
                    <h3>Total Revenue</h3>
                    <p className="val">${(analytics.totalRevenue || 0).toFixed(2)}</p>
                  </div>
                  <div className="analytics-card">
                    <h3>Total Orders</h3>
                    <p className="val">{analytics.totalOrders || 0}</p>
                  </div>
                  <div className="analytics-card">
                    <h3>Avg Order Value</h3>
                    <p className="val">${(analytics.averageOrderValue || 0).toFixed(2)}</p>
                  </div>
                  <div className="analytics-card danger">
                    <h3>Low Stock</h3>
                    <p className="val">{analytics.lowStockCount || 0}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '32px' }}>
                  {/* Top Selling Products */}
                  <div className="analytics-section" style={{ flex: 1, minWidth: '300px', background: 'var(--bg-secondary)', padding: '24px', borderRadius: '4px' }}>
                    <h3>Top Selling Products</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {(analytics.topSellingProducts || []).map((item, i) => (
                        <li key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eaeaea', padding: '12px 0' }}>
                          <span>{item.product?.name || 'Unknown'}</span>
                          <strong>{item.quantitySold} sold</strong>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Category Sales Graph */}
                  <div className="analytics-section" style={{ flex: 1, minWidth: '400px', background: 'var(--bg-secondary)', padding: '24px', borderRadius: '4px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Category Revenue</h3>
                    {Object.keys(analytics.categorySales || {}).length > 0 ? (
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(analytics.categorySales || {}).map(([cat, amount]) => ({ name: cat, Revenue: amount }))}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickFormatter={(val) => `$${val}`} />
                            <Tooltip
                              cursor={{ fill: 'transparent' }}
                              contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                              formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                            />
                            <Bar dataKey="Revenue" fill="#1a1a2e" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p>No sales data available.</p>
                    )}
                  </div>
                </div>

                <div className="low-stock-section" style={{ marginTop: '32px' }}>
                  <h3>Low Stock Items (Action Required)</h3>
                  {analytics.lowStockProducts?.length > 0 ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Current Stock</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.lowStockProducts.map(p => (
                          <tr key={p._id}>
                            <td>
                              <img src={getProductImage(p)} alt={p.name} className="admin-tbl-img" />
                            </td>
                            <td>{p.name}</td>
                            <td style={{ color: 'var(--error)', fontWeight: 'bold' }}>{p.stock}</td>
                            <td>
                              <button className="btn-small" onClick={() => { setActiveTab('products'); handleOpenModal('edit', p); }}>Update</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No low stock items currently.</p>
                  )}
                </div>
              </>
            ) : (
              <p>Failed to load analytics.</p>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="admin-tab-content">
            <div className="admin-header-flex">
              <h2>Manage Products</h2>
              <button className="btn-primary" onClick={() => handleOpenModal('create')}>+ Add Product</button>
            </div>
            
            <div className="admin-search">
              <input 
                type="text" 
                placeholder="Search products by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p._id}>
                    <td>
                      <img src={getProductImage(p)} alt={p.name} className="admin-tbl-img" />
                    </td>
                    <td>{p.name}</td>
                    <td>${p.price}</td>
                    <td>
                      <span className={p.stock < 3 ? 'stock-low' : 'stock-ok'}>{p.stock}</span>
                    </td>
                    <td>
                      <button className="btn-small edit" onClick={() => handleOpenModal('edit', p)}>Edit</button>
                      <button className="btn-small delete" onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-tab-content">
            <div className="admin-header-flex">
              <h2>All Placed Orders</h2>
            </div>
            
            <div className="admin-search">
              <input 
                type="text" 
                placeholder="Search orders by Order ID or User ID..." 
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="admin-search-input"
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User ID</th>
                    <th>Product ID</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={o._id}>
                      <td className="mono">{o._id}</td>
                      <td className="mono">{o.userId}</td>
                      <td className="mono">{o.productId}</td>
                      <td>{o.quantity}</td>
                      <td>${o.totalPrice}</td>
                      <td>
                        <span className={`status-badge ${o.status?.toLowerCase() || 'pending'}`}>
                          {o.status || 'Pending'}
                        </span>
                      </td>
                      <td>{new Date(o.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center' }}>No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>{modalMode === 'create' ? 'Create New Product' : 'Edit Product'}</h3>
            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={currentProduct.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={currentProduct.category} onChange={handleChange} required className="admin-search-input" style={{padding: '10px 12px'}}>
                  <option value="">Select Category</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Knitwear">Knitwear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Footwear">Footwear</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={currentProduct.description} onChange={handleChange} required rows={3} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input type="number" step="0.01" name="price" value={currentProduct.price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" name="stock" value={currentProduct.stock} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Product Image</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {currentProduct.imageUrl && !imageFile && (
                  <div style={{ marginTop: '8px', fontSize: '12px' }}>
                    Current image: <a href={currentProduct.imageUrl} target="_blank" rel="noreferrer">View</a>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}