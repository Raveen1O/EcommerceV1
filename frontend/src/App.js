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

Amplify.configure(awsConfig);

export default function App(){
  return (
    <div>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-status" element={<OrderStatus />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/craft" element={<Craft />} />
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
