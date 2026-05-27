// src/ProductDisplay.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ProductDisplay = ({ products, loading }) => {
  if (loading) return <div>Loading Storefront Grid...</div>;
  if (!products || products.length === 0) return <div>No matching items found.</div>;

  return (
    <div>
      {products.map((product) => (
        <div key={product.product_id} style={{ border: '1px solid black', margin: '10px 0', padding: '10px' }}>
          <div>
            <img src={product.product_image} alt={product.product_name} width="120" />
          </div>
          <div>
            <h3>{product.product_name}</h3>
            <div>Price: ₹{product.product_price}</div>
            
            {/* Navigates directly to the Option A Dynamic Detail Path */}
            <Link to={`/product/${product.product_id}`}>
              <button>View Full Product Details</button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductDisplay;