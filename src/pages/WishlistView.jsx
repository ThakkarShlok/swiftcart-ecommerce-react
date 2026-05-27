// src/WishlistView.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, authHeaders } from '../api/apiConfig';

const WishlistView = ({ token, isLoggedIn }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Exact Endpoint URLs matched against document index matrices
  const LIST_WISHLIST_URL = getApiUrl('api-list-wishlist.php');
  const REMOVE_WISHLIST_URL = getApiUrl('api-delete-wishlist.php');

  const fetchDatabaseWishlist = async () => {
    const cachedUserId = localStorage.getItem('stored_user_id');
    
    if (!isLoggedIn || !cachedUserId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('user_id', cachedUserId);

      const res = await axios.post(LIST_WISHLIST_URL, payload, {
        headers: authHeaders(token)
      });

      if (res.data && res.data.flag === "1") {
        setWishlistItems(res.data.wishlist || []);
      } else {
        setWishlistItems([]);
      }
    } catch (err) {
      console.error("Wishlist fetch failure:", err);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseWishlist();
  }, [isLoggedIn]);

  const handleRemoveItem = async (wishlistId) => {
    try {
      const payload = new FormData();
      payload.append('wishlist_id', wishlistId);

      const res = await axios.post(REMOVE_WISHLIST_URL, payload, {
        headers: authHeaders(token)
      });

      if (res.data.flag == "1" || res.data.flag == 1) {
        alert(res.data.message || "Removed item from wishlist.");
        fetchDatabaseWishlist(); 
      } else {
        alert(res.data.message || "Server rejected item drops.");
      }
    } catch (err) {
      console.error("Removal failure tracking details:", err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div>
        <h2>Your Personal Wishlist Collection</h2>
        <p>Please log in to manage your saved items.</p>
        <Link to="/login"><button>Go to Login</button></Link>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div>
        <h2>Your Personal Wishlist Collection</h2>
        <p>Your wishlist is empty.</p>
        <Link to="/"><button>Explore Store Catalog</button></Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Your Personal Wishlist Collection</h2>
      <div>
        {wishlistItems.map((item) => (
          <div key={item.wishlist_id} style={{ border: '1px solid black', margin: '10px 0', padding: '10px' }}>
            <h4>{item.product_name}</h4>
            <img src={item.product_image} alt={item.product_name} width="80" />
            <p>Price Point: ₹{item.product_price}</p>
            
            <div>
              <Link to={`/product/${item.product_id}`}>
                <button>View Specifications</button>
              </Link>
              <button 
                onClick={() => handleRemoveItem(item.wishlist_id)} 
                style={{ marginLeft: '10px', color: 'red' }}
              >
                Delete Entry
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistView;