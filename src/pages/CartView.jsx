// src/CartView.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, authHeaders, API_TOKEN } from '../api/apiConfig';

const CartView = ({ token, isLoggedIn, userId }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Restored: Your exact active project security token sequence
  const ACTIVE_TOKEN = API_TOKEN;

  // Restored: Your verified microservice mapping layout endpoints
  const LIST_CART_URL = getApiUrl('api-list-cart.php');     
  const UPDATE_QTY_URL = getApiUrl('api-update-cart.php');  
  const DELETE_CART_URL = getApiUrl('api-delete-cart.php'); 

  const fetchDatabaseCart = async () => {
    if (!isLoggedIn || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('user_id', userId);

      // Sending the token through headers as expected by your workspace configuration
      const config = {
        headers: authHeaders(ACTIVE_TOKEN)
      };

      const res = await axios.post(LIST_CART_URL, dataPayload, config);

      // Restored: Tracking your exact backend array response key ('cart_list')
      if (res.data && res.data.flag === "1") {
        setCartItems(res.data.cart_list || []);
      } else {
        setCartItems([]); 
      }
    } catch (err) {
      console.error("Cart query transmission broken:", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseCart();
  }, []);

  const handleUpdateQuantityBackend = async (cartId, newQty) => {
    if (newQty < 1) {
      handleDeleteCartItemBackend(cartId);
      return;
    }

    try {
      const updatePayload = new FormData();
      updatePayload.append('cart_id', cartId);
      updatePayload.append('product_qty', String(newQty));
      
      const config = {
        headers: authHeaders(ACTIVE_TOKEN)
      };

      const res = await axios.post(UPDATE_QTY_URL, updatePayload, config);

      if (String(res.data.flag) === "1" || String(res.data.status) === "1") {
        fetchDatabaseCart(); 
      } else {
        alert(res.data.message || "Failed to update item quantity parameters.");
      }
    } catch (err) {
      console.error("Quantity sync error:", err);
    }
  };

  const handleDeleteCartItemBackend = async (cartId) => {
    try {
      const deletePayload = new FormData();
      deletePayload.append('cart_id', cartId);
      
      const config = {
        headers: authHeaders(ACTIVE_TOKEN)
      };

      const res = await axios.post(DELETE_CART_URL, deletePayload, config);

      if (String(res.data.flag) === "1" || String(res.data.status) === "1") {
        alert(res.data.message || "Item removed from cart.");
        fetchDatabaseCart();
      } else {
        alert(res.data.message || "Server rejected deletion.");
      }
    } catch (err) {
      console.error("Network error deleting row:", err);
    }
  };

  // Restored: Your custom arithmetic layout engine for calculation of grand totals
  const grandTotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product_price || 0);
    const qty = parseInt(item.product_qty || 1, 10);
    return sum + (price * qty);
  }, 0);

  if (!isLoggedIn || !userId) {
    return (
      <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
        <h2>Your Shopping Cart</h2>
        <p>Please log in to view and manage your shopping cart items.</p>
        <Link to="/login"><button style={{ padding: "8px 15px", cursor: "pointer" }}>Go to Login</button></Link>
      </div>
    );
  }

  if (loading) return <div style={{ padding: "30px", fontFamily: "sans-serif" }}>Querying backend server cart parameters...</div>;

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
        <h2>Your Shopping Cart</h2>
        <p>Your cart is empty.</p>
        <Link to="/"><button style={{ padding: "8px 15px", cursor: "pointer" }}>Go Shopping</button></Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h2>Your Shopping Cart</h2>
      <div>
        {cartItems.map((item) => {
          const currentQty = parseInt(item.product_qty || 1, 10);
          const price = parseFloat(item.product_price || 0);
          
          return (
            <div key={item.cart_id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '8px' }}>
              <h4>{item.product_name}</h4>
              <img src={item.product_image} alt={item.product_name} width="80" style={{ objectFit: 'contain', display: 'block', margin: '10px 0' }} />
              <p>Unit Price: ₹{item.product_price}</p>
              
              <div style={{ margin: '10px 0' }}>
                {/* Safe inline wrappers to ensure interaction controls only fire on deliberate click triggers */}
                <button onClick={() => handleUpdateQuantityBackend(item.cart_id, currentQty - 1)}>-</button>
                <span style={{ margin: '0 10px', fontWeight: 'bold' }}> Quantity: {currentQty} </span>
                <button onClick={() => handleUpdateQuantityBackend(item.cart_id, currentQty + 1)}>+</button>
              </div>

              <p>Subtotal: <strong>₹{price * currentQty}</strong></p>
              <button onClick={() => handleDeleteCartItemBackend(item.cart_id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                Remove From Cart
              </button>
            </div>
          );
        })}
      </div>

      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
      <h3>Grand Total: ₹{grandTotal}</h3>
      <button 
  onClick={() => navigate('/checkout')} 
  style={{ 
    padding: '10px 20px', 
    backgroundColor: '#2ecc71', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    fontWeight: 'bold' 
  }}
>
  Proceed to Checkout
</button>
    </div>
  );
};

export default CartView;