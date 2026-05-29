// src/pages/ProductsView.jsx - Clean Category Browser (No Rating Summary)
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';

const ProductsView = ({ products, loading, onAddToCart }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  // Read category from URL on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const formattedCategory = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
      setSelectedCategory(formattedCategory);
    }
  }, [searchParams]);

  // Get unique categories with product counts
  const categories = useMemo(() => {
    const categoryMap = new Map();
    products?.forEach((product) => {
      const catName = product.category_name || 'Other';
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1);
    });
    return [['All', products?.length || 0], ...Array.from(categoryMap.entries())];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products || [];
    
    if (selectedCategory !== 'All') {
      result = result.filter(
        (product) => (product.category_name || 'Other') === selectedCategory
      );
    }
    
    if (sortBy === 'priceLow') {
      result = [...result].sort((a, b) => Number(a.product_price || 0) - Number(b.product_price || 0));
    } else if (sortBy === 'priceHigh') {
      result = [...result].sort((a, b) => Number(b.product_price || 0) - Number(a.product_price || 0));
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => (b.product_rating || 0) - (a.product_rating || 0));
    }
    
    return result;
  }, [products, selectedCategory, sortBy]);

  const heroCategories = [
    { name: 'Electronics', icon: '💻', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Fashion', icon: '👕', gradient: 'from-pink-500 to-rose-500' },
    { name: 'Home & Living', icon: '🏠', gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Accessories', icon: '⌚', gradient: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Category Grid */}
      <section className="bg-gradient-to-r from-ink-900 to-ink-800 text-white py-12">
        <div className="container-custom">
          <p className="eyebrow text-copper-400">Browse by category</p>
          <h1 className="text-3xl md:text-4xl font-black mt-2 mb-8">Shop by Department</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {heroCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  navigate(`/products?category=${cat.name.toLowerCase()}`);
                }}
                className={`bg-gradient-to-r ${cat.gradient} p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300 shadow-lg`}
              >
                <span className="text-4xl mb-2 block">{cat.icon}</span>
                <span className="font-bold text-white">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter Bar with Sort */}
      <div className="sticky top-16 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-between py-3 gap-3">
            <div className="flex overflow-x-auto gap-2 scrollbar-hide flex-1">
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
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-ink-600 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="rating">Sort: Top Rated</option>
              <option value="priceLow">Sort: Price (Low to High)</option>
              <option value="priceHigh">Sort: Price (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-custom py-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
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
            <p className="text-ink-500 text-lg">No products in this category</p>
            <Button variant="ghost" onClick={() => setSelectedCategory('All')} className="mt-4">
              View all products
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsView;