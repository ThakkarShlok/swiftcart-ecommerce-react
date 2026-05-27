// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, authHeaders, API_TOKEN } from './api/apiConfig';
import CategoryList from './components/CategoryList';
import SubcategoryList from './components/SubcategoryList';
import UserRegistration from './pages/UserRegistration';
import UserLogin from './pages/UserLogin';
import ShopView from './pages/ShopView';
import ContactUs from './pages/ContactUs';
import ProductDetail from './pages/ProductDetail';
import CartView from './pages/CartView';
import WishlistView from './pages/WishlistView';
import HomeView from './pages/HomeView';
import ProductsView from './pages/ProductsView';
import AboutUs from './pages/AboutUs';
import CheckoutView from './pages/CheckoutView';
import OrdersView from './pages/OrdersView';
import LoginWithOtp from './pages/LoginWithOtp';
import VerifyOtp from './pages/VerifyOtp';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedId = localStorage.getItem('stored_user_id');
    const storedName = localStorage.getItem('stored_user_name');
    if (storedId) {
      setIsLoggedIn(true);
      setUserData({ user_id: storedId, user_name: storedName || 'Customer' });
    }
  }, []);

  const HOME_PRODUCTS_URL = getApiUrl('api-list-product.php');
  const ADD_CART_URL = getApiUrl('api-add-cart.php');

  const loadAllProducts = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      const res = await axios.post(HOME_PRODUCTS_URL, formData, {
        headers: authHeaders(API_TOKEN)
      });
      if (res.data && res.data.flag === "1") {
        setProducts(res.data.product_list || []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Home products fetch error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllProducts();
  }, []);

  const handleAddToCartBackend = async (product) => {
    if (!isLoggedIn || !userData?.user_id) {
      alert("Please login first to manage your cart.");
      navigate('/login');
      return;
    }

    try {
      const cartPayload = new FormData();
      cartPayload.append('user_id', userData.user_id);
      cartPayload.append('product_id', product.product_id);
      cartPayload.append('product_qty', '1'); 

      const res = await axios.post(ADD_CART_URL, cartPayload, {
        headers: authHeaders(API_TOKEN)
      });

      if (res.data.flag == "1" || res.data.flag == 1) {
        alert(res.data.message || "Item added to your cart!");
      } else {
        alert(res.data.message || "Could not complete cart action.");
      }
    } catch (err) {
      console.error("Cart error:", err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem('stored_user_id');
    localStorage.removeItem('stored_user_name');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    navigate('/');
  };

  const processedProducts = products.filter(item =>
    item?.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showSearchInput = location.pathname === '/' || location.pathname === '/products' || location.pathname === '/shop';

  return (
    <div>
      <main>
        <Routes>
          <Route element={<Layout isLoggedIn={isLoggedIn} userData={userData} handleLogout={handleLogout} searchQuery={searchQuery} setSearchQuery={setSearchQuery} showSearchInput={showSearchInput} />}>
            <Route index element={<HomeView products={processedProducts} loading={loading} />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="products" element={<ProductsView products={processedProducts} loading={loading} />} />
            <Route path="product/:id" element={<ProductDetail token={API_TOKEN} isLoggedIn={isLoggedIn} userId={userData?.user_id} onAddToCart={handleAddToCartBackend} />} />
            <Route path="cart" element={isLoggedIn ? <CartView token={API_TOKEN} isLoggedIn={isLoggedIn} userId={userData?.user_id} /> : <Navigate to="/" replace />} />
            <Route path="wishlist" element={<WishlistView token={API_TOKEN} isLoggedIn={isLoggedIn} />} />
            <Route path="checkout" element={isLoggedIn ? <CheckoutView isLoggedIn={isLoggedIn} userId={userData?.user_id} /> : <Navigate to="/" replace />} />
            <Route path="orders" element={isLoggedIn ? <OrdersView token={API_TOKEN} isLoggedIn={isLoggedIn} userId={userData?.user_id} /> : <Navigate to="/" replace />} />
            <Route path="categories" element={<CategoryList onViewSubcategory={(catId) => navigate(`/subcategories?category=${catId}`)} />} />
            <Route path="subcategories" element={<SubcategoryList onSubcategoryClick={() => navigate('/')} />} />
            <Route path="shop" element={<ShopView globalSearchQuery={searchQuery} token={API_TOKEN} onAddToCart={handleAddToCartBackend} />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="register" element={<UserRegistration onRegisterSuccess={() => navigate('/login')} />} />
            <Route path="login" element={<UserLogin onLoginSuccess={(info) => { setIsLoggedIn(true); setUserData(info); navigate('/'); }} />} />
            <Route path="login-otp" element={<LoginWithOtp />} />
            <Route path="verify-otp" element={<VerifyOtp onLoginSuccess={(info) => { setIsLoggedIn(true); setUserData(info); navigate('/'); }} />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;