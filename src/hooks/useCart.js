// src/hooks/useCart.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiUrl, authHeaders, API_TOKEN } from '../api/apiConfig';

export const useCart = (userId, isLoggedIn) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn || !userId) {
      setCartItems([]);
      setCartCount(0);
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('user_id', userId);

      const res = await axios.post(getApiUrl('api-list-cart.php'), payload, {
        headers: authHeaders(API_TOKEN)
      });

      if (res.data?.flag === "1") {
        const items = res.data.cart_list || [];
        setCartItems(items);
        setCartCount(items.reduce((sum, item) => sum + parseInt(item.product_qty || 1), 0));
      } else {
        setCartItems([]);
        setCartCount(0);
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
      setCartItems([]);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  }, [userId, isLoggedIn]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn || !userId) return { success: false, message: 'Please login first' };

    try {
      const payload = new FormData();
      payload.append('user_id', userId);
      payload.append('product_id', productId);
      payload.append('product_qty', String(quantity));

      const res = await axios.post(getApiUrl('api-add-cart.php'), payload, {
        headers: authHeaders(API_TOKEN)
      });

      if (String(res.data.flag) === "1") {
        await fetchCart();
        return { success: true, message: res.data.message || 'Added to cart' };
      }
      return { success: false, message: res.data.message || 'Failed to add to cart' };
    } catch (err) {
      return { success: false, message: 'Network error' };
    }
  };

  return { cartItems, loading, cartCount, fetchCart, addToCart };
};