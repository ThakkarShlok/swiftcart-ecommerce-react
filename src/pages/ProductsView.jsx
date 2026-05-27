// src/ProductsView.jsx
import React from 'react';
import ProductDisplay from '../components/ProductDisplay';

const ProductsView = ({ products, loading }) => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ 
        borderBottom: '2px solid #f1f5f9', 
        paddingBottom: '12px', 
        marginBottom: '24px' 
      }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.8rem' }}>
         Products Catalog
        </h2>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          Showing {products?.length || 0} items available across all categories.
        </p>
      </div>

      {/* Render the reusable layout card stream engine */}
      <ProductDisplay products={products} loading={loading} />
    </div>
  );
};

export default ProductsView;