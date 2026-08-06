import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Products from './components/Products';
import ProductListing from './components/ProductListing';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import Payment from './components/Payment';
import OrderStatus from './components/OrderStatus';
import awsConfig from './aws-exports';
import { Amplify } from 'aws-amplify';
import ConfirmRegistration from "./components/ConfirmRegistration";
import AdminDashboard from "./components/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import OrderHistory from './components/OrderHistory';
import Wishlist from './components/Wishlist';
import Craft from './components/Craft';
import CustomerRoute from './components/CustomerRoute';

Amplify.configure(awsConfig);

export default function App(){
  return (
    <div>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<CustomerRoute><Products /></CustomerRoute>} />
          <Route path="/products" element={<CustomerRoute><ProductListing /></CustomerRoute>} />
          <Route path="/product/:id" element={<CustomerRoute><ProductDetail /></CustomerRoute>} />
          <Route path="/cart" element={<CustomerRoute><Cart /></CustomerRoute>} />
          <Route path="/payment" element={<CustomerRoute><Payment /></CustomerRoute>} />
          <Route path="/order-status" element={<CustomerRoute><OrderStatus /></CustomerRoute>} />
          <Route path="/orders" element={<CustomerRoute><OrderHistory /></CustomerRoute>} />
          <Route path="/wishlist" element={<CustomerRoute><Wishlist /></CustomerRoute>} />
          <Route path="/craft" element={<CustomerRoute><Craft /></CustomerRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm" element={<ConfirmRegistration />} />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}
