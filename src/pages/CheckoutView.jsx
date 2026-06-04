import { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/ui/Button';
import { ToastContainer, useToast } from '../components/ui/Toast';
import { getApiUrl, authHeaders } from '../api/apiConfig';

const EMAILJS_SERVICE_ID      = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID     = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY      = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// ── Razorpay public key (KEY_ID only — safe to expose on client) ──────────
// The KEY_SECRET lives ONLY in /api/create-order.js and /api/verify-payment.js
// and is NEVER sent to the browser.
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

// ── API base for Vercel serverless functions ──────────────────────────────
// When frontend and /api/* are on the same Vercel deployment (which is the
// default), we use RELATIVE paths — no PROXY_URL needed, no CORS issue.
// Only override via env if you've split frontend & API to different domains.
const API_BASE = import.meta.env.VITE_PAYMENT_PROXY_URL?.replace(/\/$/, '') || '';

// Dynamically load Razorpay checkout script — deferred until user clicks Pay
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script    = document.createElement('script');
    script.src      = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload   = () => resolve(true);
    script.onerror  = () => resolve(false);
    document.body.appendChild(script);
  });

const CheckoutView = ({ isLoggedIn, userId, userEmail }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Cart total: passed via router state (preferred) or global fallback ──
  // CartView does: navigate('/checkout', { state: { total } })
  // This is safer than window.__swiftcartTotal which can be stale on refresh.
  const cartTotal = location.state?.total ?? window.__swiftcartTotal ?? 0;

  const WHATSAPP_NUMBER = '918128698935';

  const buildWhatsAppUrl = () => {
    const ref = orderRef ? `#${orderRef}` : '';
    const msg = [
      `Hi SwiftCart! 👋`,
      ``,
      `My order ${ref} has been placed successfully.`,
      ``,
      `📦 Delivery details:`,
      `Name: ${shippingName}`,
      `Mobile: ${shippingMobile}`,
      `Address: ${shippingAddress}`,
      `Payment: ${paymentMethod}`,
      ``,
      `Please confirm and keep me updated. Thank you!`,
    ].join('\n');
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  const { toasts, addToast, removeToast } = useToast();
  const emailSentRef = useRef(false);

  const [shippingName,    setShippingName]    = useState('');
  const [shippingMobile,  setShippingMobile]  = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod,   setPaymentMethod]   = useState('COD');
  const [submitting,      setSubmitting]      = useState(false);
  const [isOrderSuccess,  setIsOrderSuccess]  = useState(false);
  const [orderRef,        setOrderRef]        = useState('');
  const [razorpayPaymentId, setRazorpayPaymentId] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !userId) navigate('/');
  }, [isLoggedIn, userId, navigate]);

  const sendConfirmationEmail = async (ref) => {
    if (emailSentRef.current) return;
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.warn('EmailJS env vars not set — skipping confirmation email.');
      return;
    }
    const recipientEmail = userEmail || '';
    if (!recipientEmail) {
      console.warn('No user email available — skipping confirmation email.');
      return;
    }
    emailSentRef.current = true;
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email:         recipientEmail,
          customer_name:    shippingName,
          order_ref:        ref || 'N/A',
          shipping_name:    shippingName,
          shipping_mobile:  shippingMobile,
          shipping_address: shippingAddress,
          payment_method:   paymentMethod,
        },
        EMAILJS_PUBLIC_KEY
      );
      console.log('✅ Order confirmation email sent to', recipientEmail);
    } catch (err) {
      console.error('EmailJS error:', err);
      emailSentRef.current = false;
    }
  };

  const generateCheckoutInvoice = async () => {
    setDownloadingInvoice(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });

      const PAGE_W  = 210;
      const MARGIN  = 18;
      const COL_R   = PAGE_W - MARGIN;
      const GREEN   = [0, 135, 90];
      const INK_950 = [15, 20, 29];
      const INK_400 = [161, 161, 170];
      const SURF    = [244, 244, 245];

      doc.setFillColor(...GREEN);
      doc.rect(0, 0, PAGE_W, 28, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('SwiftCart', MARGIN, 17);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('ORDER CONFIRMATION', COL_R, 12, { align: 'right' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      if (orderRef) doc.text(`Order #${orderRef}`, COL_R, 20, { align: 'right' });

      let y = 40;
      doc.setTextColor(...INK_950);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Delivery details', MARGIN, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...INK_400);
      const details = [
        ['Name',    shippingName],
        ['Mobile',  shippingMobile],
        ['Address', shippingAddress],
        ['Payment', paymentMethod],
        ['Date',    new Date().toLocaleDateString('en-IN')],
      ];
      details.forEach(([label, val]) => {
        doc.setFont('helvetica', 'bold');   doc.setTextColor(...INK_950);
        doc.text(`${label}:`, MARGIN, y);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...INK_400);
        doc.text(String(val || 'N/A'), MARGIN + 28, y);
        y += 7;
      });

      doc.setTextColor(...INK_950); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.text('SwiftCart', COL_R, 40, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...INK_400);
      doc.text('A-1705 Mondeal Heights, Satellite', COL_R, 47, { align: 'right' });
      doc.text('Ahmedabad, Gujarat - 380015',       COL_R, 54, { align: 'right' });
      doc.text('swiftcartsupport2026@gmail.com',    COL_R, 61, { align: 'right' });

      y = Math.max(y + 4, 78);
      doc.setDrawColor(228, 228, 231); doc.setLineWidth(0.4);
      doc.line(MARGIN, y, COL_R, y); y += 12;

      doc.setFillColor(...SURF);
      doc.rect(MARGIN, y - 5, COL_R - MARGIN, 28, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...INK_950);
      doc.text('What happens next?', MARGIN + 4, y + 2);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...INK_400);
      doc.text('1. We will confirm your order within 24 hours.',               MARGIN + 4, y + 10);
      doc.text('2. You will receive a shipping notification once dispatched.', MARGIN + 4, y + 17);
      y += 36;

      doc.setDrawColor(228, 228, 231); doc.line(MARGIN, y, COL_R, y); y += 8;
      doc.setFontSize(7.5); doc.setTextColor(...INK_400);
      doc.text('Thank you for shopping with SwiftCart!  ·  Free shipping above Rs.999  ·  30-day returns', MARGIN, y);
      y += 5;
      doc.text('swiftcartsupport2026@gmail.com  ·  +91 81286 98935  ·  swiftcart.com', MARGIN, y);
      doc.setFontSize(7);
      doc.text(
        'Page 1 of 1  ·  SwiftCart Order Confirmation' + (orderRef ? `  ·  Order #${orderRef}` : ''),
        PAGE_W / 2, 290, { align: 'center' }
      );

      const invoiceFileName = orderRef
        ? `SwiftCart-Order-${orderRef}.pdf`
        : 'SwiftCart-Order.pdf';
      doc.save(invoiceFileName);
    } catch (err) {
      console.error('Checkout invoice error:', err);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  // ── Razorpay payment handler ─────────────────────────────────────────────
  const handleRazorpayPayment = async () => {
    // Guard: RAZORPAY_KEY (public KEY_ID) must be set in .env
    // RAZORPAY_KEY_SECRET is NEVER checked here — it only exists server-side
    if (!RAZORPAY_KEY) {
      addToast('Payment gateway not configured. Please use Cash on Delivery.', 'error');
      return false;
    }

    // Step 1: Load Razorpay checkout.js
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      addToast('Could not load payment gateway. Check your connection.', 'error');
      return false;
    }

    // Step 2: Get cart total
    // Prefer router state (most reliable), fall back to window global
    const amountInPaise = Math.round(cartTotal * 100);
    if (!amountInPaise || amountInPaise < 100) {
      addToast('Cart total is invalid. Please return to cart and try again.', 'error');
      return false;
    }

    // Step 3: Create order via Vercel serverless function
    // Uses RELATIVE URL — works on Vercel (same domain) and localhost (Vite proxy)
    let razorpayOrderId;
    try {
      const createRes = await fetch(`${API_BASE}/api/create-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          amount:  amountInPaise,
          receipt: `rcpt_${userId}_${Date.now()}`.slice(0, 40),
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData.razorpay_order_id) {
        throw new Error(createData.error || 'Order creation failed');
      }
      razorpayOrderId = createData.razorpay_order_id;
    } catch (err) {
      console.error('[Razorpay] Create order error:', err);
      addToast('Could not initiate payment. Please try again.', 'error');
      return false;
    }

    // Step 4: Open Razorpay checkout modal
    return new Promise((resolve) => {
      const options = {
        key:         RAZORPAY_KEY,    // ✅ Public KEY_ID only — safe on client
        order_id:    razorpayOrderId,
        name:        'SwiftCart',
        description: 'Secure checkout',
        prefill: {
          name:    shippingName,
          contact: shippingMobile,
        },
        theme: { color: '#00875A' },
        modal: {
          ondismiss: () => {
            addToast('Payment cancelled. Your cart is saved.', 'warning');
            setSubmitting(false);
            resolve(false);
          },
        },
        handler: async (response) => {
          // Step 5: Verify HMAC signature via serverless function
          // The KEY_SECRET is used server-side — client never sees it
          try {
            const verifyRes = await fetch(`${API_BASE}/api/verify-payment`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              setRazorpayPaymentId(response.razorpay_payment_id);
              resolve(response.razorpay_payment_id); // truthy = success
            } else {
              addToast('Payment verification failed. Contact support.', 'error');
              setSubmitting(false);
              resolve(false);
            }
          } catch (err) {
            console.error('[Razorpay] Verify error:', err);
            addToast(
              `Verification error. Keep this payment ID: ${response.razorpay_payment_id}`,
              'error'
            );
            setSubmitting(false);
            resolve(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        console.error('[Razorpay] Payment failed:', resp.error);
        addToast(resp.error?.description || 'Payment failed. Try again.', 'error');
        setSubmitting(false);
        resolve(false);
      });
      rzp.open();
    });
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!isLoggedIn || !userId) {
      addToast('Session expired. Please sign in again.', 'error');
      navigate('/');
      return;
    }

    if (!shippingName || !shippingMobile || !shippingAddress) {
      addToast('Please fill in all delivery details.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const isRazorpay = paymentMethod !== 'COD';

      if (isRazorpay) {
        const paymentId = await handleRazorpayPayment();
        if (!paymentId) return; // user cancelled or error — already handled
      }

      // Save order to existing PHP backend (unchanged)
      const orderPayload = new FormData();
      orderPayload.append('user_id',          userId);
      orderPayload.append('shipping_name',    shippingName);
      orderPayload.append('shipping_mobile',  shippingMobile);
      orderPayload.append('shipping_address', shippingAddress);
      orderPayload.append('payment_method',   paymentMethod);
      if (razorpayPaymentId) {
        orderPayload.append('razorpay_payment_id', razorpayPaymentId);
      }

      const res = await axios.post(
        getApiUrl('api-add-order.php'),
        orderPayload,
        { headers: authHeaders() }
      );

      if (String(res.data.flag) === '1' || String(res.data.status) === '1') {
        const ref = res.data.order_id || res.data.id || '';
        setOrderRef(ref);
        setIsOrderSuccess(true);
        sendConfirmationEmail(ref);
      } else {
        addToast(res.data.message || 'Could not save your order.', 'error');
      }
    } catch (err) {
      console.error('Order error:', err);
      addToast('Network error. Please check your connection and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────
  if (isOrderSuccess) {
    return (
      <div className="container-custom py-16">
        <div className="card-surface mx-auto max-w-lg p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-copper-500 text-3xl text-white">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-black text-ink-950">Order confirmed!</h1>
          {orderRef && (
            <p className="mt-1 text-sm font-semibold text-ink-400">Order #{orderRef}</p>
          )}
          <p className="mt-3 text-sm text-ink-500 leading-relaxed">
            Your order has been placed successfully. We'll get it to you soon.
          </p>

          {userEmail && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-ink-100 bg-surface-100 px-4 py-2 text-xs text-ink-500">
              <svg className="h-3.5 w-3.5 shrink-0 text-copper-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Confirmation sent to <span className="font-semibold text-ink-700">{userEmail}</span>
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-surface-100 border border-ink-100 p-4 text-left space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 mb-2">Delivery details</p>
            <p className="text-sm text-ink-700"><span className="font-semibold text-ink-950">Name:</span> {shippingName}</p>
            <p className="text-sm text-ink-700"><span className="font-semibold text-ink-950">Mobile:</span> {shippingMobile}</p>
            <p className="text-sm text-ink-700"><span className="font-semibold text-ink-950">Address:</span> {shippingAddress}</p>
            <p className="text-sm text-ink-700"><span className="font-semibold text-ink-950">Payment:</span> {paymentMethod}</p>
            {razorpayPaymentId && (
              <p className="text-sm text-ink-700"><span className="font-semibold text-ink-950">Payment ID:</span> {razorpayPaymentId}</p>
            )}
          </div>

          <div className="mt-6 grid gap-3">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1ebe5d] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
            >
              <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Send order details on WhatsApp
            </a>

            <button
              onClick={generateCheckoutInvoice}
              disabled={downloadingInvoice}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloadingInvoice ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating invoice…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  Download order invoice
                </>
              )}
            </button>

            <Button size="lg" fullWidth onClick={() => navigate('/orders')}>
              View my orders
            </Button>

            <button
              onClick={() => navigate('/')}
              className="text-sm font-medium text-ink-400 hover:text-ink-600 transition-colors"
            >
              Continue shopping
            </button>
          </div>

          <p className="mt-5 text-xs text-ink-300">
            WhatsApp opens in a new tab with your order details pre-filled.
          </p>
        </div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  // ── Checkout form ────────────────────────────────────────────────────────
  return (
    <div className="container-custom py-10">
      <div className="mb-8">
        <p className="eyebrow">Secure checkout</p>
        <h1 className="section-heading mt-2">Confirm delivery details</h1>
        <p className="section-copy mt-2">Keep checkout short, explicit, and low-friction so shoppers can complete the order confidently.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="card-surface p-6">
          <form onSubmit={handlePlaceOrder} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-bold text-ink-700">
                Recipient name
                <input type="text" value={shippingName} onChange={(e) => setShippingName(e.target.value)} placeholder="Full name" className="field mt-2" required />
              </label>
              <label className="text-sm font-bold text-ink-700">
                Mobile number
                <input type="tel" value={shippingMobile} onChange={(e) => setShippingMobile(e.target.value.replace(/\D/g, ''))} placeholder="10-digit mobile number" className="field mt-2" required />
              </label>
            </div>

            <label className="block text-sm font-bold text-ink-700">
              Shipping address
              <textarea rows={4} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="House number, street, city, state, pin code" className="field mt-2" required />
            </label>

            <label className="block text-sm font-bold text-ink-700">
              Payment method
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="field mt-2">
                <option value="COD">Cash on delivery</option>
                <option value="Card">Credit / debit card (Razorpay)</option>
                <option value="UPI">UPI (Razorpay)</option>
                <option value="Netbanking">Net banking (Razorpay)</option>
              </select>
            </label>

            <Button type="submit" fullWidth size="lg" loading={submitting}>
              {submitting
                ? (paymentMethod === 'COD' ? 'Placing order…' : 'Opening payment…')
                : paymentMethod === 'COD'
                ? 'Place order — Cash on delivery'
                : 'Pay securely with Razorpay'}
            </Button>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="card-surface p-6">
            <h2 className="text-xl font-bold text-ink-950">Why this works</h2>
            <div className="mt-4 grid gap-3 text-sm text-ink-500">
              <p><span className="font-bold text-ink-950">Delivery:</span> address is captured in one obvious step.</p>
              <p><span className="font-bold text-ink-950">Payment:</span> defaults to COD for trust in Indian e-commerce.</p>
              <p><span className="font-bold text-ink-950">Support:</span> help stays visible before final action.</p>
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-ink-950 p-6 text-white">
            <h2 className="text-lg font-bold">Need help?</h2>
            <p className="mt-2 text-sm leading-6 text-surface-200">Our team is here before and after your order.</p>
            <a
              href="https://wa.me/918128698935"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1ebe5d]"
            >
              <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </aside>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default CheckoutView;
