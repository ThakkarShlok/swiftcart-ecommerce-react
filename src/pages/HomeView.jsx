// src/HomeView.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeView = ({ products, loading }) => {
  const navigate = useNavigate();

  // UX Optimization: Keeping exactly 8 items to create 2-3 clean rows of products
  const featuredProducts = products ? products.slice(0, 8) : [];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', padding: '10px 20px' }}>
      
      {/* Premium Visual Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #111827, #1f2937, #374151)',
        padding: '50px 40px',
        borderRadius: '12px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ flex: 1, paddingRight: '20px' }}>
          <span style={{ backgroundColor: '#e74c3c', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>
            NEW ARRIVALS
          </span>
          <h1 style={{ fontSize: '2.4rem', margin: '12px 0 10px 0', lineHeight: '1.2' }}>
            Discover Premium Tech Elegance
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#d1d5db', marginBottom: '25px', maxWidth: '500px' }}>
            Upgrade your standard workspace setup with top-tier performance accessories and devices tested for durability.
          </p>
          <button 
            onClick={() => navigate('/products')}
            style={{ padding: '12px 24px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Browse Full Collection →
          </button>
        </div>
        
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <img 
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" 
            alt="Store Featured Banner" 
            style={{ width: '100%', maxWidth: '360px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}
          />
        </div>
      </div>

      {/* Featured Products Collection (Multi-Row Grid) */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '1.5rem', fontWeight: '700' }}>Trending Handpicked Items</h2>
          <button 
            onClick={() => navigate('/products')}
            style={{ background: 'none', border: 'none', color: '#3498db', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
          >
            See All Products ({products?.length || 0})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading store inventory...</div>
        ) : featuredProducts.length === 0 ? (
          <div style={{ color: '#888', padding: '20px 0' }}>No items available on the storefront currently.</div>
        ) : (
          /* Dynamic layout template matching the dashboard reference aesthetics */
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
            gap: '25px' 
          }}>
            {featuredProducts.map((product) => (
              <div 
                key={product.product_id}
                style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '10px', 
                  padding: '16px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  backgroundColor: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <img src={product.product_image} alt={product.product_name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', height: '38px', overflow: 'hidden', color: '#374151', lineHeight: '1.4' }}>
                    {product.product_name}
                  </h4>
                  <div style={{ fontWeight: '700', color: '#e74c3c', fontSize: '1.15rem', marginBottom: '14px' }}>
                    ₹{product.product_price}
                  </div>
                  <button 
                    onClick={() => navigate(`/product/${product.product_id}`)}
                    style={{ width: '100%', padding: '9px 0', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#4b5563' }}
                  >
                    View Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default HomeView;