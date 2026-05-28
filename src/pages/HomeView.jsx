// src/pages/HomeView.jsx
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';

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
    { title: 'Free delivery', desc: 'On orders above Rs. 999', icon: '🚚' },
    { title: 'Easy returns', desc: '30-day hassle-free policy', icon: '🔄' },
    { title: 'Secure checkout', desc: 'Encrypted payment flow', icon: '🔒' },
    { title: 'Support', desc: 'Online help in the same day', icon: '🎧' },
  ];

  return (
    <div>
      {/* Hero Section - Updated with better image */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sapphire-50 via-white to-copper-50">
        <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(197,138,95,0.18),transparent_38%)]" />
        <div className="container-custom grid min-h-[580px] items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <div className="relative z-10">
            <p className="eyebrow">Refined shopping</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">
              A calm, confident storefront built for quick decisions.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink-500">
              Clear product hierarchy, concise trust signals, and a lightweight browsing experience that feels modern and dependable.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate('/shop')}>Start shopping</Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/products')}>Browse catalog</Button>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 divide-x divide-ink-200 rounded-[1.5rem] border border-ink-100 bg-surface-500 text-center shadow-soft">
              <div className="p-4">
                <div className="text-xl font-black text-ink-950">8k+</div>
                <div className="text-xs text-ink-500">Products</div>
              </div>
              <div className="p-4">
                <div className="text-xl font-black text-ink-950">4.7</div>
                <div className="text-xs text-ink-500">Average rating</div>
              </div>
              <div className="p-4">
                <div className="text-xl font-black text-ink-950">24h</div>
                <div className="text-xs text-ink-500">Dispatch</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-ink-900/10 via-white to-copper-200/20 blur-2xl" />
            {/* UPDATED: Better hero image - Shopping lifestyle */}
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=85"
              alt="Online shopping delivery experience"
              className="relative aspect-[4/3] w-full rounded-[2rem] object-cover shadow-soft"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-3xl border border-white/80 bg-white/95 p-4 shadow-lg backdrop-blur sm:left-auto sm:w-72">
              <p className="text-sm font-bold text-ink-950">Focused discovery</p>
              <p className="mt-1 text-sm leading-5 text-ink-500">High-contrast product cards, durable filters, and fast path actions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid - Enhanced with icons */}
      <section className="bg-surface-100 py-12">
        <div className="container-custom">
          <div className="text-center mb-8">
            <p className="eyebrow">Shop by category</p>
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

      {/* Featured Products Section */}
      <section className="container-custom py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Featured collection</p>
            <h2 className="section-heading mt-2">Products worth noticing</h2>
            <p className="section-copy mt-3">A curated product grid with readable pricing, accessible CTA focus, and clean product summaries.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/products')}>View all products</Button>
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

      {/* Trust Indicators Section */}
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