// src/pages/ProductsView.jsx - REDESIGNED as Category Browser
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';

const ProductsView = ({ products, loading, onAddToCart }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get unique categories with product counts
  const categories = useMemo(() => {
    const categoryMap = new Map();
    products?.forEach((product) => {
      const catName = product.category_name || 'Other';
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1);
    });
    return [['All', products?.length || 0], ...Array.from(categoryMap.entries())];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products || [];
    return (products || []).filter(
      (product) => (product.category_name || 'Other') === selectedCategory
    );
  }, [products, selectedCategory]);

  // Hero categories for visual browsing
  const heroCategories = [
    { name: 'Electronics', icon: '💻', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Fashion', icon: '👕', gradient: 'from-pink-500 to-rose-500' },
    { name: 'Home & Living', icon: '🏠', gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Accessories', icon: '⌚', gradient: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Category Grid - Visual browsing */}
      <section className="bg-gradient-to-r from-ink-900 to-ink-800 text-white py-12">
        <div className="container-custom">
          <p className="eyebrow text-copper-400">Browse by category</p>
          <h1 className="text-3xl md:text-4xl font-black mt-2 mb-8">Shop by Department</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {heroCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate(`/products?category=${cat.name.toLowerCase()}`)}
                className={`bg-gradient-to-r ${cat.gradient} p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300 shadow-lg`}
              >
                <span className="text-4xl mb-2 block">{cat.icon}</span>
                <span className="font-bold text-white">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter Bar */}
      <div className="sticky top-16 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="container-custom">
          <div className="flex overflow-x-auto py-3 gap-2 scrollbar-hide">
            {categories.map(([catName, count]) => (
              <button
                key={catName}
                onClick={() => setSelectedCategory(catName)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  selectedCategory === catName
                    ? 'bg-copper-600 text-white shadow-md'
                    : 'bg-gray-100 text-ink-600 hover:bg-gray-200'
                }`}
              >
                {catName} <span className="text-xs opacity-70">({count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-custom py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-ink-950">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </h2>
            <p className="text-sm text-ink-500">{filteredProducts.length} items found</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/shop')}>
            Advanced filters →
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[390px] animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <p className="text-ink-500">No products in this category</p>
            <Button variant="ghost" onClick={() => setSelectedCategory('All')} className="mt-4">
              View all products
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.slice(0, 12).map((product) => (
              <ProductCard key={product.product_id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}

        {filteredProducts.length > 12 && (
          <div className="text-center mt-8">
            <Button variant="secondary" onClick={() => navigate('/shop')}>
              View all {filteredProducts.length} products →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsView;