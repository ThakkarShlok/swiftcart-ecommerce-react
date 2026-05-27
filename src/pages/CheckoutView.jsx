// src/CheckoutView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, authHeaders } from '../api/apiConfig';

const CheckoutView = ({ isLoggedIn, userId }) => {
  const navigate = useNavigate();
  const CHECKOUT_URL = getApiUrl('api-add-order.php');

  // Form input capture variables
  const [shippingName, setShippingName] = useState('');
  const [shippingMobile, setShippingMobile] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); 
  const [submitting, setSubmitting] = useState(false);
  
  // 🟢 State flag controlling execution view toggle to display image_7b1c6d.png layout
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !userId) {
      navigate('/');
    }
  }, [isLoggedIn, userId, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn || !userId) {
      alert("Session expired. Please log in again to complete checkout verification workflows.");
      navigate('/');
      return;
    }

    if (!shippingName || !shippingMobile || !shippingAddress) {
      alert("All shipping metadata attributes are required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = new FormData();
      orderPayload.append('user_id', userId);
      orderPayload.append('shipping_name', shippingName);
      orderPayload.append('shipping_mobile', shippingMobile);
      orderPayload.append('shipping_address', shippingAddress);
      orderPayload.append('payment_method', paymentMethod);

      const config = {
        headers: authHeaders()
      };

      const res = await axios.post(CHECKOUT_URL, orderPayload, config);

      if (String(res.data.flag) === "1" || String(res.data.status) === "1") {
        // Intercept navigation stream and display success card layout state instead
        setIsOrderSuccess(true);
      } else {
        alert(res.data.message || "Checkout rejected by distribution microservice rules.");
      }
    } catch (err) {
      console.error("Order transmission dropped on routing pipeline:", err);
      alert("Network error processing order layout variables.");
    } finally {
      setSubmitting(false);
    }
  };

  // 🟢 CONDITIONAL VIEW FOR THE THANK YOU CARD (Matching image_7b1c6d.png)
  if (isOrderSuccess) {
    return (
      <div style={{
        backgroundColor: '#a78bfa', // Light violet/purple border accent environment simulation
        padding: '60px 20px',
        minHeight: '80vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}>
        {/* Main Card Surface */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '45px 40px',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
        }}>
          
          {/* Green Check Circle Asset */}
          <div style={{
            width: '76px',
            height: '76px',
            backgroundColor: '#2ecc71',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto 30px auto'
          }}>
            <span style={{ color: 'white', fontSize: '38px', fontWeight: 'bold' }}>✓</span>
          </div>

          {/* Heading Text */}
          <h1 style={{ 
            color: '#1e293b', 
            fontSize: '36px', 
            fontWeight: '600', 
            margin: '0 0 20px 0',
            lineHeight: '1.2'
          }}>
            Thank you for your order!
          </h1>

          {/* Body Paragraph Layout */}
          <p style={{ 
            color: '#64748b', 
            fontSize: '15px', 
            lineHeight: '1.6', 
            margin: '0 0 35px 0',
            fontWeight: '400'
          }}>
            Your order has now been placed and you will shortly receive an email confirmation. You can check the status of your order at any time by going to{' '}
            <span 
              onClick={() => navigate('/orders')}
              style={{ 
                color: '#0066cc', 
                textDecoration: 'none', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                borderBottom: '1px solid transparent'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              'My Order'
            </span>.
          </p>

          {/* Dedicated Tracking Action Button Context */}
          <button
            onClick={() => navigate('/orders')}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '5px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              boxShadow: '0 4px 12px rgba(52, 152, 219, 0.2)'
            }}
          >
            Track & View Orders
          </button>

        </div>
      </div>
    );
  }

  // STANDARD CHECKOUT ENTRY FORM
  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Secure Checkout</h2>
      <p style={{ color: '#64748b' }}>Please fulfill your delivery deployment logistics parameters below.</p>
      <hr style={{ borderColor: '#f1f5f9', marginBottom: '20px' }} />

      <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Recipient Name:</label>
          <input 
            type="text" 
            placeholder="John Doe"
            value={shippingName} 
            onChange={(e) => setShippingName(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Contact Number (Mobile):</label>
          <input 
            type="tel" 
            placeholder="9876543210"
            value={shippingMobile} 
            onChange={(e) => setShippingMobile(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Shipping Address Log:</label>
          <textarea 
            placeholder="Enter full physical destination structure layout details"
            value={shippingAddress} 
            onChange={(e) => setShippingAddress(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Payment Mode Integration:</label>
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
          >
            <option value="COD">Cash On Delivery (COD)</option>
            <option value="Card">Credit / Debit Card Payment Gateway</option>
            <option value="UPI">Unified Payments Interface (UPI)</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          style={{ 
            padding: '12px 20px', 
            backgroundColor: '#2ecc71', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: submitting ? 'not-allowed' : 'pointer', 
            fontWeight: 'bold',
            fontSize: '16px',
            marginTop: '10px'
          }}
        >
          {submitting ? "Processing Transaction Engine..." : "Confirm & Place Order"}
        </button>
      </form>
    </div>
  );
};

export default CheckoutView;