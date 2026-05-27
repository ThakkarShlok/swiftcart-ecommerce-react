// src/ShopView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, authHeaders, API_TOKEN } from '../api/apiConfig';

const ShopView = ({ globalSearchQuery, token }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Real-Time Sidebar Filtering & Sorting States
  const [startPrice, setStartPrice] = useState(0);
  const [endPrice, setEndPrice] = useState(100000);
  const [sortOrder, setSortOrder] = useState(''); // Options: 'lowToHigh', 'highToLow', or ''

  // UX Navigation Hook to transition across application paths cleanly
  const navigate = useNavigate();

  // Active fallback token configuration parameter matching App.jsx context
  const ACTIVE_TOKEN = token || API_TOKEN;

  useEffect(() => {
    const fetchShopItems = async () => {
      setLoading(true);
      try {
        const emptyFormData = new FormData();
        
        // Pull full master products data matrix
        const productRes = await axios.post(getApiUrl('api-list-product.php'), emptyFormData, {
          headers: authHeaders(ACTIVE_TOKEN)
        });
        
        if (productRes.data?.flag === "1") {
          setItems(productRes.data.product_list || []);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Shop items network load error:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShopItems();
  }, [ACTIVE_TOKEN]);

  // Compute live filtered elements stream matrix
  const visibleItems = items
    .filter(item => {
      const itemPrice = parseFloat(item.product_price || 0);
      const matchesPrice = itemPrice >= startPrice && itemPrice <= endPrice;
      
      const searchStr = (globalSearchQuery || '').toLowerCase();
      const matchesSearch = 
        item.product_name?.toLowerCase().includes(searchStr) ||
        item.product_details?.toLowerCase().includes(searchStr) ||
        item.category_name?.toLowerCase().includes(searchStr);

      return matchesPrice && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'lowToHigh') return parseFloat(a.product_price) - parseFloat(b.product_price);
      if (sortOrder === 'highToLow') return parseFloat(b.product_price) - parseFloat(a.product_price);
      return 0;
    });

  if (loading) return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Loading marketplace products grid...</div>;

  return (
    <div style={{ display: 'flex', padding: '20px', gap: '30px', fontFamily: 'sans-serif' }}>
      
      {/* Sidebar Navigation & Filter Panel */}
      <div style={{ width: '250px', borderRight: '1px solid #eee', paddingRight: '20px' }}>
        <h3>Filter Control Desk</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Min Price (₹):</label>
          <input 
            type="number" 
            value={startPrice} 
            onChange={(e) => setStartPrice(Number(e.target.value))} 
            style={{ width: '100%', padding: '6px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Max Price (₹):</label>
          <input 
            type="number" 
            value={endPrice} 
            onChange={(e) => setEndPrice(Number(e.target.value))} 
            style={{ width: '100%', padding: '6px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Sort By Price:</label>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ width: '100%', padding: '6px' }}
          >
            <option value="">Default (No Sorting)</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>

        <button 
          onClick={() => { setStartPrice(0); setEndPrice(100000); setSortOrder(''); }}
          style={{ width: '100%', padding: '8px', cursor: 'pointer', backgroundColor: '#eee', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          Reset All Filters
        </button>
      </div>

      {/* Primary Content Stream Matrix */}
      <div style={{ flex: 1 }}>
        <h2>Marketplace Catalog</h2>
        
        {visibleItems.length === 0 ? (
          <div style={{ color: '#888', marginTop: '20px' }}>No items match the chosen pricing, sorting, or search criteria.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {visibleItems.map(item => (
              <div 
                key={item.product_id} 
                style={{ border: '1px solid #e1e4e6', borderRadius: '8px', padding: '15px', display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: '#fff' }}
              >
                <div style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={item.product_image} alt={item.product_name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{item.product_name}</h3>
                  <div style={{ color: '#f39c12', fontSize: '14px', marginBottom: '5px' }}>Rating: ★★★★☆ (4.2)</div>
                  <div style={{ fontWeight: 'bold', color: '#e74c3c', fontSize: '1.1rem', marginBottom: '5px' }}>Price: ₹{item.product_price}</div>
                  <p style={{ color: '#666', margin: '0 0 10px 0', fontSize: '14px', lineHeight: '1.4' }}>
                    {item.product_details || "No additional description details logged."}
                  </p>
                  
                  {/* 🟢 FIXED: Updated route parameter string configuration to align with App.jsx */}
                  <button 
                    onClick={() => navigate(`/product/${item.product_id}`)}
                    style={{ padding: '8px 16px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
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

export default ShopView;