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

// ── Invoice generator ────────────────────────────────────────────────────────
const generateInvoice = async (order, items, computedTotal) => {
  // Dynamically import jsPDF — no bundle cost unless user clicks download
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const PAGE_W   = 210;
  const MARGIN   = 18;
  const COL_R    = PAGE_W - MARGIN; // right edge
  const GREEN    = [0, 135, 90];    // copper-500 = #00875A
  const INK_950  = [15, 20, 29];    // ink-950
  const INK_400  = [161, 161, 170]; // ink-400
  const SURF     = [244, 244, 245]; // surface-100

  // ── Header bar ──────────────────────────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, PAGE_W, 28, 'F');

  // Logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('SwiftCart', MARGIN, 17);

  // "TAX INVOICE" tag top-right
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('TAX INVOICE', COL_R, 12, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Order #${order.order_id}`, COL_R, 20, { align: 'right' });

  // ── Invoice meta block ───────────────────────────────────────────────────
  let y = 38;
  doc.setTextColor(...INK_950);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice details', MARGIN, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...INK_400);
  y += 6;
  doc.text(`Date: ${order.order_date || new Date().toLocaleDateString('en-IN')}`, MARGIN, y);
  y += 5;
  doc.text(`Status: ${order.order_status || 'Pending'}`, MARGIN, y);

  // ── Store address (right column) ─────────────────────────────────────────
  doc.setTextColor(...INK_950);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SwiftCart', COL_R, 38, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...INK_400);
  doc.text('A-1705 Mondeal Heights, Satellite', COL_R, 44, { align: 'right' });
  doc.text('Ahmedabad, Gujarat - 380015', COL_R, 49, { align: 'right' });
  doc.text('swiftcartsupport2026@gmail.com', COL_R, 54, { align: 'right' });
  doc.text('+91 81286 98935', COL_R, 59, { align: 'right' });

  // ── Divider ──────────────────────────────────────────────────────────────
  y = 68;
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y, COL_R, y);

  // ── Items table header ───────────────────────────────────────────────────
  y += 8;
  doc.setFillColor(...SURF);
  doc.rect(MARGIN, y - 5, COL_R - MARGIN, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...INK_950);
  const C1 = MARGIN + 2;   // Product
  const C2 = 115;           // Qty
  const C3 = 140;           // Unit price
  const C4 = COL_R;         // Subtotal

  doc.text('Product', C1, y + 1);
  doc.text('Qty', C2, y + 1);
  doc.text('Unit price', C3, y + 1);
  doc.text('Subtotal', C4, y + 1, { align: 'right' });
  y += 10;

  // ── Items rows ───────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  let subtotalSum = 0;

  items.forEach((item, idx) => {
    const name     = item.product_name || 'Product';
    const qty      = parseInt(item.product_qty || 1, 10);
    const price    = parseFloat(item.product_price || 0);
    const sub      = parseFloat(item['sub total'] || item.sub_total || price * qty);
    subtotalSum   += sub;

    // Zebra row
    if (idx % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(MARGIN, y - 5, COL_R - MARGIN, 9, 'F');
    }

    doc.setTextColor(...INK_950);
    // Truncate long product names
    const shortName = name.length > 45 ? name.substring(0, 42) + '...' : name;
    doc.text(shortName, C1, y);
    doc.setTextColor(...INK_400);
    doc.text(String(qty), C2, y);
    doc.text(`Rs.${price.toLocaleString('en-IN')}`, C3, y);
    doc.setTextColor(...INK_950);
    doc.text(`Rs.${sub.toLocaleString('en-IN')}`, C4, y, { align: 'right' });
    y += 9;

    // Page break guard
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  });

  // ── Totals block ─────────────────────────────────────────────────────────
  y += 4;
  doc.setDrawColor(228, 228, 231);
  doc.line(MARGIN, y, COL_R, y);
  y += 8;

  const finalTotal = computedTotal > 0 ? computedTotal : subtotalSum;
  const shipping   = finalTotal > 999 ? 0 : 100;
  const grandTotal = finalTotal + shipping;

  const totalsX = 130;
  doc.setFontSize(8.5);

  // Subtotal row
  doc.setTextColor(...INK_400);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal', totalsX, y);
  doc.setTextColor(...INK_950);
  doc.text(`Rs.${finalTotal.toLocaleString('en-IN')}`, COL_R, y, { align: 'right' });
  y += 7;

  // Shipping row
  doc.setTextColor(...INK_400);
  doc.text(`Shipping ${shipping === 0 ? '(Free above Rs.999)' : ''}`, totalsX, y);
  doc.setTextColor(...INK_950);
  doc.text(shipping === 0 ? 'Free' : `Rs.${shipping}`, COL_R, y, { align: 'right' });
  y += 7;

  // Grand total row
  doc.setFillColor(...GREEN);
  doc.rect(totalsX - 4, y - 5, COL_R - totalsX + 4 + MARGIN, 11, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Total', totalsX, y + 2);
  doc.text(`Rs.${grandTotal.toLocaleString('en-IN')}`, COL_R, y + 2, { align: 'right' });
  y += 18;

  // ── Policies footer ───────────────────────────────────────────────────────
  doc.setDrawColor(228, 228, 231);
  doc.line(MARGIN, y, COL_R, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_400);
  doc.text('Thank you for shopping with SwiftCart!', MARGIN, y);
  y += 5;
  doc.text('Free shipping on orders above Rs.999  ·  30-day easy returns  ·  Secure checkout', MARGIN, y);
  y += 5;
  doc.text('For support: swiftcartsupport2026@gmail.com  ·  +91 81286 98935', MARGIN, y);

  // ── Page number ───────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...INK_400);
    doc.text(
      `Page ${i} of ${pageCount}  ·  SwiftCart Invoice  ·  Order #${order.order_id}`,
      PAGE_W / 2, 290, { align: 'center' }
    );
  }

  doc.save(`SwiftCart-Invoice-${order.order_id}.pdf`);
};

const OrdersView = ({ token, isLoggedIn, userId }) => {
  const [orders, setOrders]                     = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState({});
  const [fetchingDetails, setFetchingDetails]   = useState({});
  const [cancelReasons, setCancelReasons]       = useState({});
  const [cancelling, setCancelling]             = useState({});
  const [confirmCancel, setConfirmCancel]       = useState({});
  const [orderTotals, setOrderTotals]           = useState({});
  const [downloadingInvoice, setDownloadingInvoice] = useState({});

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
        const details = res.data.order_details || [];
        setSelectedOrderDetails((prev) => ({ ...prev, [orderId]: details }));

        // Compute total from line items — api-list-order.php often returns
        // order_total as 0 or null, so we calculate it from the detail items
        const computed = details.reduce((sum, item) => {
          const price = parseFloat(item.product_price || 0);
          const qty   = parseInt(item.product_qty || 1, 10);
          const sub   = parseFloat(item['sub total'] || item.sub_total || 0);
          return sum + (sub > 0 ? sub : price * qty);
        }, 0);
        if (computed > 0) {
          setOrderTotals((prev) => ({ ...prev, [orderId]: computed }));
        }
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

  const handleDownloadInvoice = async (order) => {
    const orderId = order.order_id;
    const items   = selectedOrderDetails[orderId];

    // If items not loaded yet, fetch them first then download
    if (!items || items.length === 0) {
      setDownloadingInvoice((prev) => ({ ...prev, [orderId]: true }));
      try {
        const payload = new FormData();
        payload.append('user_id', userId);
        payload.append('order_id', orderId);
        const res = await axios.post(getApiUrl('api-list-order-detail.php'), payload, {
          headers: authHeaders(token),
        });
        if (res.data && String(res.data.flag) === '1') {
          const details = res.data.order_details || [];
          setSelectedOrderDetails((prev) => ({ ...prev, [orderId]: details }));
          const computed = details.reduce((sum, item) => {
            const price = parseFloat(item.product_price || 0);
            const qty   = parseInt(item.product_qty || 1, 10);
            const sub   = parseFloat(item['sub total'] || item.sub_total || 0);
            return sum + (sub > 0 ? sub : price * qty);
          }, 0);
          setOrderTotals((prev) => ({ ...prev, [orderId]: computed }));
          await generateInvoice(order, details, computed);
        } else {
          addToast('Could not load order details for invoice.', 'error');
        }
      } catch (err) {
        console.error('Invoice fetch error:', err);
        addToast('Failed to generate invoice.', 'error');
      } finally {
        setDownloadingInvoice((prev) => ({ ...prev, [orderId]: false }));
      }
      return;
    }

    // Items already loaded — generate directly
    setDownloadingInvoice((prev) => ({ ...prev, [orderId]: true }));
    try {
      await generateInvoice(order, items, orderTotals[orderId] || 0);
    } catch (err) {
      console.error('Invoice generation error:', err);
      addToast('Failed to generate invoice.', 'error');
    } finally {
      setDownloadingInvoice((prev) => ({ ...prev, [orderId]: false }));
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
          const apiTotal      = parseFloat(order.order_total || order.order_amount || 0);
          const computedTotal = orderTotals[orderId] || 0;
          const displayTotal  = apiTotal > 0 ? apiTotal : computedTotal > 0 ? computedTotal : null;
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
                    {displayTotal !== null
                      ? formatPrice(displayTotal)
                      : <span className="text-sm font-normal text-ink-400">Expand to view</span>
                    }
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

              {/* ── Invoice strip — always visible, full width, clearly separated ── */}
              <div className="flex items-center justify-between gap-3 border-t border-ink-100 bg-surface-100 px-5 py-3 sm:px-6">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink-500">
                    Need a record of this order?
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadInvoice(order)}
                  disabled={!!downloadingInvoice[orderId]}
                  aria-label={`Download invoice for order ${orderId}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-ink-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloadingInvoice[orderId] ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      Download invoice
                    </>
                  )}
                </button>
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
