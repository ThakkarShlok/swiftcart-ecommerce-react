// src/pages/CartView.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, authHeaders } from '../api/apiConfig';
import Button from '../components/ui/Button';
import QuantityInput from '../components/ui/QuantityInput';
import { useCart } from '../hooks/useCart';

const CartView = ({ token, isLoggedIn, userId }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  // FIXED: Move useCart hook inside component
  const { fetchCart: refreshGlobalCart } = useCart(userId, isLoggedIn);

  const fetchCart = async () => {
    if (!isLoggedIn || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('user_id', userId);
      const res = await axios.post(getApiUrl('api-list-cart.php'), payload, { headers: authHeaders(token) });
      
      if (res.data?.flag === '1') {
        const items = res.data.cart_list || [];
        setCartItems(items);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isLoggedIn, userId]);

  const updateQuantity = async (cartId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) {
      await removeItem(cartId);
      return;
    }

    setUpdating(cartId);
    try {
      const payload = new FormData();
      payload.append('cart_id', cartId);
      payload.append('product_qty', String(newQty));
      const res = await axios.post(getApiUrl('api-update-cart.php'), payload, { headers: authHeaders(token) });
      
      if (String(res.data.flag) === '1') {
        await fetchCart();
        // Refresh global cart count in Layout
        await refreshGlobalCart();
      }
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (cartId) => {
    setUpdating(cartId);
    try {
      const payload = new FormData();
      payload.append('cart_id', cartId);
      const res = await axios.post(getApiUrl('api-delete-cart.php'), payload, { headers: authHeaders(token) });
      
      if (String(res.data.flag) === '1') {
        await fetchCart();
        // Refresh global cart count in Layout
        await refreshGlobalCart();
      }
    } catch (err) {
      console.error('Remove error:', err);
    } finally {
      setUpdating(null);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(Number(price || 0));

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.product_price || 0) * Number(item.product_qty || 1), 0);
  const shipping = subtotal > 999 ? 0 : 100;
  const total = subtotal + shipping;

  if (!isLoggedIn) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="card-surface mx-auto max-w-md p-8">
          <div className="w-16 h-16 bg-copper-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-copper-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink-950">Your cart is waiting</h1>
          <p className="mt-2 text-ink-500">Sign in to view saved cart items and continue checkout.</p>
          <Link to="/login" className="mt-6 inline-flex"><Button>Sign in</Button></Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-custom py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="h-[420px] animate-pulse rounded-[1.75rem] bg-surface-200" />
          <div className="h-80 animate-pulse rounded-[1.75rem] bg-surface-200" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="card-surface mx-auto max-w-md p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink-950">Your cart is empty</h1>
          <p className="mt-2 text-ink-500">Add products from the shop to start building your order.</p>
          <Link to="/shop" className="mt-6 inline-flex"><Button>Continue shopping</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <div className="mb-8">
        <p className="eyebrow">Checkout path</p>
        <h1 className="section-heading mt-2">Shopping cart</h1>
        <p className="section-copy mt-2">Review quantity, shipping threshold, and final total before checkout.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="card-surface overflow-hidden">
          <div className="hidden grid-cols-12 gap-4 border-b border-ink-100 bg-surface-100 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-500 md:grid">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="divide-y divide-ink-100">
            {cartItems.map((item) => {
              const price = Number(item.product_price || 0);
              const qty = Number(item.product_qty || 1);
              const itemTotal = price * qty;

              return (
                <article key={item.cart_id} className="grid gap-4 p-4 md:grid-cols-12 md:items-center md:p-5">
                  <div className="flex gap-4 md:col-span-6">
                    <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-surface-100">
                      <img src={item.product_image} alt={item.product_name} className="h-full w-full object-contain p-2" />
                    </div>
                    <div>
                      <Link to={`/product/${item.product_id}`}>
                        <h2 className="line-clamp-2 font-bold text-ink-950 hover:text-copper-700 transition-colors">
                          {item.product_name}
                        </h2>
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.cart_id)}
                        disabled={updating === item.cart_id}
                        className="mt-2 text-sm font-bold text-copper-700 hover:text-copper-900 disabled:opacity-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm md:col-span-2 md:block md:text-center">
                    <span className="text-ink-500 md:hidden">Price</span>
                    <span className="font-bold text-ink-950">{formatPrice(price)}</span>
                  </div>
                  <div className="flex items-center justify-between md:col-span-2 md:justify-center">
                    <span className="text-sm text-ink-500 md:hidden">Quantity</span>
                    <QuantityInput
                      quantity={qty}
                      onIncrease={() => updateQuantity(item.cart_id, qty, 1)}
                      onDecrease={() => updateQuantity(item.cart_id, qty, -1)}
                      disabled={updating === item.cart_id}
                    />
                  </div>
                  <div className="flex justify-between md:col-span-2 md:block md:text-right">
                    <span className="text-sm text-ink-500 md:hidden">Item total</span>
                    <span className="text-lg font-black text-ink-950">{formatPrice(itemTotal)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="card-surface h-fit p-6 lg:sticky lg:top-28">
          <h2 className="text-xl font-bold text-ink-950">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-500">Subtotal</span>
              <span className="font-bold text-ink-950">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Shipping</span>
              <span className="font-bold text-ink-950">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            {subtotal > 0 && subtotal < 999 && (
              <div className="rounded-2xl bg-copper-50 p-3 text-sm font-semibold text-copper-700">
                Add {formatPrice(999 - subtotal)} more for free shipping.
              </div>
            )}
            <div className="border-t border-ink-100 pt-4">
              <div className="flex justify-between">
                <span className="font-bold text-ink-950">Total</span>
                <span className="text-2xl font-black text-ink-950">{formatPrice(total)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-500">Inclusive of all taxes.</p>
            </div>
          </div>
          <Button fullWidth size="lg" onClick={() => navigate('/checkout')} className="mt-6">
            Proceed to checkout
          </Button>
          <Link to="/shop" className="mt-4 inline-flex w-full justify-center text-sm font-bold text-copper-700 hover:text-copper-900 transition-colors">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default CartView;