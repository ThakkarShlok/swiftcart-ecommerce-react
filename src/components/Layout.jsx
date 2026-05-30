// src/components/Layout.jsx
import { useEffect, useMemo, useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import Button from './ui/Button';
import { useCart } from '../hooks/useCart';
import AIChatbot from './ui/AIChatbot';  // ← ADD THIS IMPORT

const Icon = ({ name, className = 'h-5 w-5' }) => {
  const icons = {
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />,
    cart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 4.5h2.1l1.56 9.36a2.25 2.25 0 0 0 2.22 1.89h6.72a2.25 2.25 0 0 0 2.18-1.7l1.07-4.3H7.05M9.75 20.25h.01M17.25 20.25h.01" />,
    heart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 7.13c0 5.15-7.5 9.62-7.5 9.62s-7.5-4.47-7.5-9.62A4.13 4.13 0 0 1 12 4.72a4.13 4.13 0 0 1 7.5 2.41Z" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 6 12 12M18 6 6 18" />,
    truck: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h10.5v9H3.75v-9Zm10.5 3h2.85l3.15 3.15v2.85h-6v-6ZM7.5 18.75h.01M17.25 18.75h.01" />,
    shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s7.5-3 7.5-10.5V5.25L12 3 4.5 5.25v5.25C4.5 18 12 21 12 21Z" />,
  };

  return (
    <svg className={className} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
};

// ↓ ADD products, isLoggedIn, userData to props — passed down from App.jsx
const Layout = ({ isLoggedIn, userData, handleLogout, searchQuery, setSearchQuery, showSearchInput, products }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { cartCount, fetchCart } = useCart(userData?.user_id, isLoggedIn);

  useEffect(() => {
    if (isLoggedIn && userData?.user_id) fetchCart();
  }, [isLoggedIn, userData?.user_id, fetchCart]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = useMemo(() => [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/products', label: 'Catalog' },
    { to: '/categories', label: 'Categories' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Support' },
  ], []);

  const searchBox = (
    <label className="relative block w-full">
      <span className="sr-only">Search products</span>
      <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        type="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search products, brands, categories"
        className="h-11 w-full rounded-2xl border border-ink-100 bg-surface-500 pl-10 pr-3 text-sm text-ink-950 outline-none transition placeholder:text-ink-400 focus:border-copper-500 focus:ring-4 focus:ring-copper-500/20"
      />
    </label>
  );

  return (
    <div className="min-h-screen bg-surface-100 text-ink-950">
      <div className="bg-ink-950 text-white">
        <div className="container-custom flex min-h-9 flex-wrap items-center justify-center gap-x-5 gap-y-1 py-2 text-center text-xs font-medium sm:justify-between">
          <span className="inline-flex items-center gap-2"><Icon name="truck" className="h-4 w-4 text-copper-300" /> Free shipping above Rs. 999</span>
          <span className="inline-flex items-center gap-2"><Icon name="shield" className="h-4 w-4 text-copper-300" /> Secure payments and 30-day returns</span>
        </div>
      </div>

      <header className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur transition-shadow ${isScrolled ? 'shadow-sm shadow-ink-950/5' : 'shadow-none'}`}>
        <div className="container-custom">
          <div className="flex min-h-16 items-center gap-3 py-3">
            <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="SwiftCart home">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-copper-500 text-lg font-bold text-white shadow-sm">S</span>
              <span className="leading-none">
                <span className="block text-base font-bold tracking-tight text-ink-950">SwiftCart</span>
                <span className="hidden text-[11px] font-medium text-ink-500 sm:block">Thoughtful everyday shopping</span>
              </span>
            </Link>

            {showSearchInput && <div className="hidden min-w-[280px] flex-1 lg:block">{searchBox}</div>}

            <nav className="hidden items-center gap-1 xl:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-2xl px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-copper-50 text-copper-700' : 'text-ink-600 hover:bg-surface-100 hover:text-ink-950'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <Link to="/wishlist" className="nav-icon hidden sm:inline-flex" aria-label="View wishlist">
                <Icon name="heart" />
              </Link>
              <Link to="/cart" className="nav-icon relative" aria-label="View cart">
                <Icon name="cart" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-copper-500 px-1 text-[11px] font-bold text-white animate-scale-up">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {!isLoggedIn ? (
                <div className="hidden items-center gap-2 md:flex">
                  <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
                  <Link to="/register"><Button size="sm">Create account</Button></Link>
                </div>
              ) : (
                <div className="hidden items-center gap-2 md:flex">
                  <Link to="/orders" className="inline-flex items-center gap-2 rounded-2xl bg-surface-500 px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-surface-100">
                    <Icon name="user" className="h-4 w-4" />
                    {userData?.user_name || 'Account'}
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>Sign out</Button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((value) => !value)}
                className="nav-icon xl:hidden"
                aria-label="Toggle navigation"
                aria-expanded={isMobileMenuOpen}
              >
                <Icon name={isMobileMenuOpen ? 'close' : 'menu'} />
              </button>
            </div>
          </div>

          {showSearchInput && <div className="pb-3 lg:hidden">{searchBox}</div>}
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-ink-100 bg-white xl:hidden">
            <div className="container-custom grid gap-2 py-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-2xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-copper-50 text-copper-700' : 'text-ink-700 hover:bg-surface-100'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2 sm:hidden">
                <Link to="/wishlist" className="btn-secondary justify-center">Wishlist</Link>
                <Link to="/cart" className="btn-secondary justify-center">Cart</Link>
              </div>
              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-2 pt-2 md:hidden">
                  <Link to="/login" className="btn-secondary justify-center">Sign in</Link>
                  <Link to="/register" className="btn-primary justify-center">Create account</Link>
                </div>
              ) : (
                <Button variant="secondary" fullWidth onClick={handleLogout} className="md:hidden">Sign out</Button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="min-h-[70vh]">
        <Outlet />
      </main>

      <footer className="border-t border-ink-100 bg-white">
        <div className="container-custom grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-copper-500 font-bold text-white">S</span>
              <span className="text-lg font-bold text-ink-950">SwiftCart</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-ink-500">
              A clean, practical storefront focused on product clarity, trust, and fast checkout decisions.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-950">Shop</h3>
            <div className="mt-3 grid gap-2 text-sm text-ink-500">
              <Link to="/shop" className="hover:text-copper-700">All products</Link>
              <Link to="/categories" className="hover:text-copper-700">Categories</Link>
              <Link to="/wishlist" className="hover:text-copper-700">Wishlist</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-950">Trust</h3>
            <div className="mt-3 grid gap-2 text-sm text-ink-500">
              <span>Secure checkout</span>
              <span>30-day returns</span>
              <span>Support: support@swiftcart.com</span>
            </div>
          </div>
        </div>
        <div className="border-t border-ink-100 py-4 text-center text-xs text-ink-500">
          &copy; {new Date().getFullYear()} SwiftCart. Built for modern commerce.
        </div>
      </footer>

      {/* ✦ AI Chatbot — floats globally above all pages */}
      <AIChatbot
        products={products}
        isLoggedIn={isLoggedIn}
        userData={userData}
      />

      <style jsx>{`
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up { animation: scale-up 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default Layout;
