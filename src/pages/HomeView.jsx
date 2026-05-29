// src/pages/HomeView.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';

// Professional rotating word - clean and calm
const RotatingWord = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const words = ['quality', 'trust', 'simplicity', 'speed', 'clarity'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2800);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span className="text-copper-600 transition-all duration-300 inline-block">
      {words[wordIndex]}
    </span>
  );
};

// Visitor Counter - subtle social proof
const VisitorCounter = () => {
  const [count, setCount] = useState(12487);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 2));
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="inline-flex items-center gap-2 text-sm text-ink-500 bg-white/80 backdrop-blur rounded-full px-4 py-2 shadow-sm">
      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      <span>{count.toLocaleString()} active shoppers</span>
    </div>
  );
};

const HomeView = ({ products, loading, onAddToCart }) => {
  const navigate = useNavigate();
  const featuredProducts = products?.slice(0, 8) || [];

  const categories = [
    { name: 'Electronics', detail: 'Essential tech for every room', icon: '💻', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Fashion', detail: 'Elevated everyday wear', icon: '👕', gradient: 'from-pink-500 to-rose-500' },
    { name: 'Home', detail: 'Smart lifestyle upgrades', icon: '🏠', gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Accessories', detail: 'Curated finishing touches', icon: '⌚', gradient: 'from-amber-500 to-orange-500' },
  ];

  const trustItems = [
    { title: 'Free delivery', desc: 'On orders above ₹999', icon: '🚚' },
    { title: 'Easy returns', desc: '30-day hassle-free policy', icon: '🔄' },
    { title: 'Secure checkout', desc: 'Encrypted payment flow', icon: '🔒' },
    { title: '24/7 Support', desc: 'Always here to help', icon: '🎧' },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sapphire-50 via-white to-copper-50">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-copper-200 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sapphire-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
        </div>
        
        <div className="container-custom grid min-h-[580px] items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <div className="relative z-10">
            <div className="mb-6">
              <VisitorCounter />
            </div>
            
            <p className="eyebrow animate-fade-in">✨ Refined shopping experience</p>
            
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">
              Shop with{' '}
              <RotatingWord />
            </h1>
            
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink-500">
              Clear product hierarchy, concise trust signals, and a lightweight browsing 
              experience that feels modern and dependable.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate('/shop')} className="group">
                Start shopping
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/products')}>
                Browse catalog
              </Button>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 divide-x divide-ink-200 rounded-[1.5rem] border border-ink-100 bg-surface-500 text-center shadow-soft">
              {[
                { value: '8k+', label: 'Products' },
                { value: '4.8★', label: 'Avg. rating' },
                { value: '24h', label: 'Dispatch' },
              ].map((stat, i) => (
                <div key={i} className="p-4 hover:scale-105 transition-transform cursor-default">
                  <div className="text-2xl font-black text-ink-950">{stat.value}</div>
                  <div className="text-xs text-ink-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-copper-400/30 via-sapphire-400/20 to-ink-400/30 blur-2xl group-hover:scale-105 transition-transform duration-700" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=85"
                alt="Online shopping experience"
                className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-xl bg-white shadow-xl p-3 animate-bounce-slow">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-xs text-ink-500">New season</p>
                  <p className="font-bold text-sm">Up to 40% off</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     

{/* Rating Summary - Social Proof Section */}
<div className="bg-white py-8 border-b border-gray-100">
  <div className="container-custom">
    <div className="flex flex-wrap items-center justify-center gap-8">
      <div className="text-center">
        <div className="text-3xl font-bold text-ink-950">4.8 ★</div>
        <div className="text-sm text-ink-500">Average rating</div>
        <div className="flex justify-center mt-1">
          {[1,2,3,4,5].map((star) => (
            <svg key={star} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
        </div>
      </div>
      <div className="w-px h-12 bg-gray-200" />
      <div className="text-center">
        <div className="text-3xl font-bold text-ink-950">50,000+</div>
        <div className="text-sm text-ink-500">Happy customers</div>
      </div>
      <div className="w-px h-12 bg-gray-200" />
      <div className="text-center">
        <div className="text-3xl font-bold text-ink-950">98%</div>
        <div className="text-sm text-ink-500">Would recommend</div>
      </div>
    </div>
  </div>
</div>

      {/* Category Grid */}
      <section className="bg-surface-100 py-12">
        <div className="container-custom">
          <div className="text-center mb-8">
            <p className="eyebrow text-copper-600">Shop by category</p>
            <h2 className="text-2xl md:text-3xl font-bold text-ink-950 mt-2">Browse our collections</h2>
            <p className="text-ink-500 mt-2">Find exactly what you're looking for</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => navigate(`/products?category=${cat.name.toLowerCase()}`)}
                className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${cat.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10">
                  <span className="text-4xl mb-2 block">{cat.icon}</span>
                  <p className="text-lg font-semibold text-white">{cat.name}</p>
                  <p className="mt-1 text-sm text-white/80">{cat.detail}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-custom py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-copper-600">Featured collection</p>
            <h2 className="section-heading mt-2">Products worth noticing</h2>
            <p className="section-copy mt-3">A curated product grid with readable pricing, accessible CTA focus, and clean product summaries.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/products')}>View all products →</Button>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="h-[390px] animate-pulse rounded-[1.5rem] bg-surface-200" />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="card-surface p-10 text-center text-ink-500">No products available right now.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* Trust Indicators */}
      <section className="bg-ink-950 py-12 text-white">
        <div className="container-custom">
          <div className="text-center mb-8">
            <p className="eyebrow text-copper-400">Why choose us</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-2">Shopping with confidence</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-center hover:bg-white/10 transition-all duration-300">
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-copper-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeView;