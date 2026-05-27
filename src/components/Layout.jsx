// src/Layout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const Layout = ({ isLoggedIn, userData, handleLogout, searchQuery, setSearchQuery, showSearchInput }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* UNIFORM HEADER & NAVBAR */}
      <header style={{ padding: '10px 20px', borderBottom: '1px solid #ddd' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          
          {/* THE BRANDING LOGO EMBLEM */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#ffd814',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#0f1111',
              fontSize: '18px',
              border: '1px solid #fcd200'
            }}>
              S
            </div>
            <strong style={{ color: '#0f1111', fontSize: '20px', letterSpacing: '0.5px' }}>SwiftCart</strong>
          </Link>

          {/* NAVIGATION BUTTON ACTIONS */}
          <nav style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/"><button>Home</button></Link>
            <Link to="/about"><button>About Us</button></Link>
            <Link to="/products"><button onClick={() => setSearchQuery('')}>Products</button></Link>
            <Link to="/categories"><button>Category</button></Link>
            <Link to="/shop"><button onClick={() => setSearchQuery('')}>Shop</button></Link>
            <Link to="/contact"><button>Contact Us</button></Link>
            
            <Link to="/cart"><button>View Cart</button></Link>
            <Link to="/wishlist"><button>Wishlist</button></Link>

            {/* DYNAMIC AUTHENTICATED ACTIONS */}
            {isLoggedIn && (
              <Link to="/orders">
                <button style={{ backgroundColor: '#3498db', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Track Orders
                </button>
              </Link>
            )}

            {!isLoggedIn ? (
              <>
                <Link to="/register"><button>Register</button></Link>
                <Link to="/login"><button>Login</button></Link>
              </>
            ) : (
              <>
                <Link to="/profile"><button>Profile</button></Link>
                <span style={{ fontSize: '14px', color: '#565959' }}>Hi, {userData?.user_name}</span>
                <button onClick={handleLogout}>Logout</button>
              </>
            )}

            {/* LIVE STOREFRONT INPUT SEARCH BUFFER */}
            {showSearchInput && (
              <input 
                type="text" 
                placeholder="Search things instantly..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}
          </nav>
        </div>
      </header>

      {/* CORE CONTENT APP CONTAINER OUTLET */}
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>

      {/* UNIFORM APP FOOTER */}
      <footer style={{ 
        borderTop: '1px solid #ddd', 
        padding: '20px', 
        textAlign: 'center', 
        backgroundColor: '#fcfcfc',
        fontSize: '13px',
        color: '#565959'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ fontWeight: 'bold', color: '#0f1111' }}>SwiftCart</span> Marketplace System
        </div>
        <div>&copy; {new Date().getFullYear()} All Rights Reserved. Prepared for Sandbox Demonstration Routing.</div>
      </footer>

    </div>
  );
};

export default Layout;