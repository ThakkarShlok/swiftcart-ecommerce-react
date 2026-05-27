// src/pages/AboutUs.jsx
import React from 'react';
import profileImg from '../assets/Professional Photo (5).png';

const AboutUs = () => {
  return (
    <div style={{ padding: '40px 30px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto', color: '#1e293b' }}>

      {/* ── Page Header ── */}
      <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '16px', marginBottom: '36px' }}>
        <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>About SwiftCart</h2>
        <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '15px' }}>
          A modern e-commerce platform built for fast, reliable, and seamless online shopping.
        </p>
      </div>

      {/* ── What is SwiftCart ── */}
      <div style={{ marginBottom: '36px', lineHeight: '1.75', color: '#334155' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>What is SwiftCart?</h3>
        <p style={{ margin: '0 0 14px 0' }}>
          SwiftCart is an online shopping platform where customers can browse a live product catalog, 
          discover items across categories, manage their cart and wishlist, and place orders — all from 
          a single, fast web application. Product data, user accounts, cart contents, and order history 
          are all stored and retrieved in real time from a backend server, making SwiftCart a fully 
          functional data-driven shopping experience rather than a static storefront.
        </p>
        <p style={{ margin: 0 }}>
          The platform is designed around speed and clarity. Every interaction — adding to cart, 
          filtering by price, submitting a review, tracking an order — gets a direct response. 
          There are no dead ends: loading states keep the user informed while data is in transit, 
          empty states guide them when nothing is available, and error handling ensures the app 
          never silently fails.
        </p>
      </div>

      {/* ── Feature cards ── */}
      <div style={{ marginBottom: '36px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>What SwiftCart offers</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {[
            {
              title: 'Smart Product Discovery',
              desc: 'Shop by category, subcategory, or search by name. Filter by price range and sort results to find exactly what you\'re looking for.'
            },
            {
              title: 'Cart & Wishlist',
              desc: 'Add products to your cart or save them to your wishlist. Adjust quantities on the fly — your cart total updates instantly.'
            },
            {
              title: 'Checkout & Payments',
              desc: 'Enter your delivery details and choose from Cash on Delivery, Card, or UPI. Orders are confirmed with a dedicated order confirmation screen.'
            },
            {
              title: 'Order Tracking',
              desc: 'View your complete order history, expand individual orders to see item-level details, and cancel active orders when needed.'
            },
            {
              title: 'Secure Authentication',
              desc: 'Sign in with email and password, or use a mobile OTP for a password-free login. Your session stays active across browser refreshes.'
            },
            {
              title: 'Customer Reviews',
              desc: 'Read verified customer reviews on any product. Share your own experience with a star rating and written feedback.'
            },
          ].map((item) => (
            <div key={item.title} style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '18px 20px',
            }}>
              <p style={{ margin: '0 0 7px 0', fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{item.title}</p>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '1.65' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tech stack pills ── */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '14px', color: '#1e293b' }}>Technology</h3>
        <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#475569', lineHeight: '1.7' }}>
          SwiftCart runs on a React 19 frontend powered by Vite, with React Router v7 handling 
          all client-side navigation and Axios managing every API request. The application communicates 
          with a REST API backend over authenticated HTTP — all sensitive configuration is managed 
          through environment variables and never exposed in the codebase.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {['React 19', 'Vite 8', 'React Router v7', 'Axios', 'JavaScript ES2022', 'REST API', 'ESLint'].map((tech) => (
            <span key={tech} style={{
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              padding: '5px 13px',
              fontSize: '13px',
              fontWeight: '500',
            }}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <hr style={{ border: 'none', borderTop: '2px solid #f1f5f9', marginBottom: '36px' }} />

      {/* ── Developer section ── */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>Meet the Developer</h3>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Photo — 240×240 frame */}
          <div style={{
            flex: '0 0 240px',
            height: '240px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
            backgroundColor: '#e2e8f0',
          }}>
            <img
              src={profileImg}
              alt="Shlok Thakkar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Bio */}
          <div style={{ flex: 1, minWidth: '260px' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: '700', color: '#1e293b' }}>Shlok Thakkar</h4>
            <p style={{ margin: '0 0 18px 0', color: '#3b82f6', fontSize: '14px', fontWeight: '600' }}>
              Lead Developer &amp; Product Architect — SwiftCart
            </p>

            <p style={{ margin: '0 0 13px 0', fontSize: '14px', color: '#475569', lineHeight: '1.75' }}>
              Shlok architects and maintains the complete frontend of SwiftCart — from the component 
              structure and routing layer to API integration and state management. He handles all 
              client-server communication across 20 REST endpoints, managing data flow for auth, 
              products, cart, orders, wishlist, and reviews through a centralized API configuration layer.
            </p>

            <p style={{ margin: '0 0 13px 0', fontSize: '14px', color: '#475569', lineHeight: '1.75' }}>
              Shlok manages the application's authentication system — including both the email/password 
              flow and the two-step OTP login — along with session persistence, protected route 
              enforcement, and auth-aware UI across the entire application.
            </p>

            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#475569', lineHeight: '1.75' }}>
              He also oversees the product discovery experience: the real-time search, price range 
              filtering, and sort pipeline in the Shop view; and the lazy-loaded order detail system.
            </p>

            {/* Links */}
            <div style={{ display: 'flex', gap: '16px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
              <a
                href="https://github.com/ThakkarShlok"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none', color: '#475569', fontSize: '13px', fontWeight: '600' }}
              >
                <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub" width="17" height="17" />
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/shlok-thakkar-58a033354?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none', color: '#475569', fontSize: '13px', fontWeight: '600' }}
              >
                <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="17" height="17" />
                LinkedIn
              </a>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AboutUs;
