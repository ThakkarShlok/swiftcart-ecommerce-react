// src/pages/OrdersView.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { getApiUrl, authHeaders } from '../api/apiConfig';
import Button from '../components/ui/Button';
import { ToastContainer, useToast } from '../components/ui/Toast';

const formatPrice = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })
    .format(Number(val || 0));

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  const styles = {
    cancelled:  'bg-red-50   text-red-700   border-red-100',
    delivered:  'bg-copper-50 text-copper-700 border-copper-100',
    shipped:    'bg-sapphire-50 text-sapphire-700 border-sapphire-100',
  };
  const cls = styles[s] || 'bg-surface-200 text-ink-600 border-ink-100';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {status || 'Pending'}
    </span>
  );
};

const OrdersView = ({ token, isLoggedIn, userId }) => {
  const [orders, setOrders]                     = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState({});
  const [fetchingDetails, setFetchingDetails]   = useState({});
  const [cancelReasons, setCancelReasons]       = useState({});
  const [cancelling, setCancelling]             = useState({});
  const [confirmCancel, setConfirmCancel]       = useState({});

  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  // ── All API logic preserved exactly from original ────────────────────────────

  const fetchOrderLog = async () => {
    if (!isLoggedIn || !userId) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('user_id', userId);
      const res = await axios.post(getApiUrl('api-list-order.php'), payload, {
        headers: authHeaders(token),
      });
      if (res.data && String(res.data.flag) === '1') {
        setOrders(res.data.order_list || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Orders fetch error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && userId) fetchOrderLog();
  }, [isLoggedIn, userId]);

  const toggleOrderExpansion = async (orderId) => {
    if (selectedOrderDetails[orderId]) {
      const updated = { ...selectedOrderDetails };
      delete updated[orderId];
      setSelectedOrderDetails(updated);
      return;
    }
    setFetchingDetails((prev) => ({ ...prev, [orderId]: true }));
    try {
      const payload = new FormData();
      payload.append('user_id', userId);
      payload.append('order_id', orderId);
      const res = await axios.post(getApiUrl('api-list-order-detail.php'), payload, {
        headers: authHeaders(token),
      });
      if (res.data && String(res.data.flag) === '1') {
        setSelectedOrderDetails((prev) => ({
          ...prev,
          [orderId]: res.data.order_details || [],
        }));
      }
    } catch (err) {
      console.error('Order details fetch error:', err);
    } finally {
      setFetchingDetails((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = cancelReasons[orderId]?.trim();
    if (!reason) return;
    if (!confirmCancel[orderId]) {
      setConfirmCancel((prev) => ({ ...prev, [orderId]: true }));
      return;
    }
    setConfirmCancel((prev) => ({ ...prev, [orderId]: false }));

    setCancelling((prev) => ({ ...prev, [orderId]: true }));
    try {
      const payload = new FormData();
      payload.append('user_id', userId);
      payload.append('order_id', orderId);
      payload.append('cancel_reason', reason);
      const res = await axios.post(getApiUrl('api-order-cancel.php'), payload, {
        headers: authHeaders(token),
      });
      if (res.data && String(res.data.flag) === '1') {
        addToast(res.data.message || 'Order cancelled successfully.', 'success');
        setCancelReasons((prev) => { const r = { ...prev }; delete r[orderId]; return r; });
        fetchOrderLog();
      } else {
        addToast(res.data.message || 'Could not cancel this order.', 'error');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
    } finally {
      setCancelling((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container-custom py-10">
        <div className="mb-8">
          <div className="h-3 w-24 animate-pulse rounded-full bg-surface-200" />
          <div className="mt-3 h-8 w-48 animate-pulse rounded-full bg-surface-200" />
        </div>
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded-full bg-surface-200" />
                  <div className="h-3 w-24 animate-pulse rounded-full bg-surface-200" />
                </div>
                <div className="h-4 w-20 animate-pulse rounded-full bg-surface-200" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-surface-200" />
                <div className="h-9 w-28 animate-pulse rounded-2xl bg-surface-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!loading && orders.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="card-surface mx-auto max-w-md p-10 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-surface-200 text-3xl">
            📦
          </div>
          <h2 className="text-xl font-bold text-ink-950">No orders yet</h2>
          <p className="mt-2 text-sm text-ink-500">
            When you place an order it will appear here.
          </p>
          <Link to="/shop">
            <Button size="lg" className="mt-6">Start shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Main page ────────────────────────────────────────────────────────────────
  return (
    <div className="container-custom py-10">
      {/* Page header */}
      <div className="mb-8">
        <p className="eyebrow">Account</p>
        <h1 className="section-heading mt-2">My orders</h1>
        <p className="section-copy mt-2">
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed with SwiftCart.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {orders.map((order) => {
          const orderId   = order.order_id;
          const isExpanded   = !!selectedOrderDetails[orderId];
          const isFetching   = !!fetchingDetails[orderId];
          const isCancelling = !!cancelling[orderId];
          const items        = selectedOrderDetails[orderId] || [];
          const displayTotal = order.order_total || order.order_amount || '0.00';
          const isCancelled  = order.order_status?.toLowerCase() === 'cancelled';

          return (
            <div key={orderId} className="card-surface overflow-hidden">
              {/* ── Order summary row ── */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
                {/* Left — ID + date */}
                <div>
                  <p className="text-sm font-bold text-ink-950">
                    Order #{orderId}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {order.order_date || 'Date unavailable'}
                  </p>
                </div>

                {/* Centre — amount */}
                <div className="text-center">
                  <p className="text-xs text-ink-400">Total</p>
                  <p className="mt-0.5 text-base font-black text-ink-950">
                    {formatPrice(displayTotal)}
                  </p>
                </div>

                {/* Status badge */}
                <StatusBadge status={order.order_status} />

                {/* Expand button */}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toggleOrderExpansion(orderId)}
                  loading={isFetching}
                >
                  {isFetching
                    ? 'Loading…'
                    : isExpanded
                    ? 'Hide items'
                    : 'View items'}
                  {!isFetching && (
                    <svg
                      className={`ml-1 inline h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Button>
              </div>

              {/* ── Expanded: line items ── */}
              {isExpanded && (
                <div className="border-t border-ink-100 bg-surface-100 px-5 py-5 sm:px-6">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-400">
                    Items in this order
                  </p>

                  {items.length === 0 ? (
                    <p className="text-sm text-ink-400">No item details available.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {items.map((item, idx) => {
                        const productName  = item.product_name || 'Unknown product';
                        const imageUrl     = item.product_image;
                        const qty          = parseInt(item.product_qty || 1, 10);
                        const price        = parseFloat(item.product_price || 0);
                        const subtotal     = item['sub total'] || item.sub_total || price * qty;

                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-4 rounded-xl border border-ink-100 bg-white p-3"
                          >
                            {/* Thumbnail */}
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-surface-100">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={productName}
                                  className="h-full w-full object-contain p-1"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="h-full w-full" />
                              )}
                            </div>

                            {/* Name + qty */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-ink-950">
                                {productName}
                              </p>
                              <p className="mt-0.5 text-xs text-ink-400">
                                Qty: {qty} × {formatPrice(price)}
                              </p>
                            </div>

                            {/* Subtotal */}
                            <p className="shrink-0 text-sm font-black text-ink-950">
                              {formatPrice(subtotal)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Cancel section ── */}
                  {!isCancelled && (
                    <div className="mt-5 border-t border-ink-100 pt-5">
                      <p className="mb-2 text-xs font-semibold text-ink-500">
                        Need to cancel?
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="text"
                          placeholder="Reason for cancellation"
                          value={cancelReasons[orderId] || ''}
                          onChange={(e) =>
                            setCancelReasons((prev) => ({
                              ...prev,
                              [orderId]: e.target.value,
                            }))
                          }
                          className="field flex-1"
                          style={{ minWidth: 200 }}
                        />
                        {confirmCancel[orderId] ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-ink-500">Are you sure?</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              loading={isCancelling}
                              onClick={() => handleCancelOrder(orderId)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              Yes, cancel
                            </Button>
                            <button
                              onClick={() => setConfirmCancel((prev) => ({ ...prev, [orderId]: false }))}
                              className="text-xs font-medium text-ink-400 hover:text-ink-600"
                            >
                              Keep order
                            </button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            loading={isCancelling}
                            onClick={() => handleCancelOrder(orderId)}
                            disabled={!cancelReasons[orderId]?.trim()}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            {isCancelling ? 'Cancelling…' : 'Cancel order'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default OrdersView;
