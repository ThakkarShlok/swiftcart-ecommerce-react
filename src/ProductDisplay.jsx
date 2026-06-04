// src/ProductDisplay.jsx
// React import not required with new JSX transform
import ProductCard from './components/ui/ProductCard';

const ProductDisplay = ({ products, loading, onAddToCart }) => {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse rounded-[1.5rem] bg-surface-200 h-[320px]" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="rounded-[1.5rem] bg-white border border-ink-100 p-10 text-center text-ink-500">
        No matching items found.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.product_id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};

export default ProductDisplay;
