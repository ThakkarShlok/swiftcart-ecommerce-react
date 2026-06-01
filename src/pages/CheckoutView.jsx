import { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/ui/Button';
import { ToastContainer, useToast } from '../components/ui/Toast';
import { getApiUrl, authHeaders } from '../api/apiConfig';

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const CheckoutView = ({ isLoggedIn, userId, userEmail }) => {
  const navigate = useNavigate();

  const WHATSAPP_NUMBER = '918128698935'; // +91 8128698935

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
  const emailSentRef = useRef(false); // guard — send confirmation email exactly once
  const [shippingName, setShippingName] = useState('');
  const [shippingMobile, setShippingMobile] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [orderRef, setOrderRef]             = useState('');

  useEffect(() => {
    if (!isLoggedIn || !userId) navigate('/');
  }, [isLoggedIn, userId, navigate]);

  const sendConfirmationEmail = async (ref) => {
    // Guard: only ever send once, even if effect re-runs
    if (emailSentRef.current) return;
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.warn('EmailJS env vars not set — skipping confirmation email.');
      return;
    }
    // Need a recipient email — passed from App.jsx via userData.user_email
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
          to_email:       recipientEmail,
          customer_name:  shippingName,
          order_ref:      ref || 'N/A',
          shipping_name:  shippingName,
          shipping_mobile: shippingMobile,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
        },
        EMAILJS_PUBLIC_KEY
      );
      console.log('✅ Order confirmation email sent to', recipientEmail);
    } catch (err) {
      // Email failure is non-critical — order is already placed
      // Don't show an error toast, just log it silently
      console.error('EmailJS error:', err);
      emailSentRef.current = false; // allow retry if needed
    }
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
      const orderPayload = new FormData();
      orderPayload.append('user_id', userId);
      orderPayload.append('shipping_name', shippingName);
      orderPayload.append('shipping_mobile', shippingMobile);
      orderPayload.append('shipping_address', shippingAddress);
      orderPayload.append('payment_method', paymentMethod);

      const res = await axios.post(getApiUrl('api-add-order.php'), orderPayload, { headers: authHeaders() });
      if (String(res.data.flag) === '1' || String(res.data.status) === '1') {
        const ref = res.data.order_id || res.data.id || '';
        setOrderRef(ref);
        setIsOrderSuccess(true);
        // Fire confirmation email — non-blocking, fails silently if EmailJS not configured
        sendConfirmationEmail(ref);
      } else {
        addToast(res.data.message || 'Could not place your order.', 'error');
      }
    } catch (err) {
      console.error('Order error:', err);
      addToast('Network error. Please check your connection and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isOrderSuccess) {
    return (
      <div className="container-custom py-16">
        <div className="card-surface mx-auto max-w-lg p-8 text-center">
          {/* Success icon */}
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

          {/* Email confirmation note */}
          {userEmail && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-ink-100 bg-surface-100 px-4 py-2 text-xs text-ink-500">
              <svg className="h-3.5 w-3.5 shrink-0 text-copper-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Confirmation sent to <span className="font-semibold text-ink-700">{userEmail}</span>
            </div>
          )}

          {/* Delivery summary */}
          <div className="mt-6 rounded-2xl bg-surface-100 border border-ink-100 p-4 text-left space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 mb-2">Delivery details</p>
            <p className="text-sm text-ink-700"><span className="font-semibold text-ink-950">Name:</span> {shippingName}</p>
            <p className="text-sm text-ink-700"><span className="font-semibold text-ink-950">Mobile:</span> {shippingMobile}</p>
            <p className="text-sm text-ink-700"><span className="font-semibold text-ink-950">Address:</span> {shippingAddress}</p>
            <p className="text-sm text-ink-700"><span className="font-semibold text-ink-950">Payment:</span> {paymentMethod}</p>
          </div>

          <div className="mt-6 grid gap-3">
            {/* WhatsApp notification CTA */}
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
                <option value="Card">Credit / debit card</option>
                <option value="UPI">UPI</option>
              </select>
            </label>

            <Button type="submit" fullWidth size="lg" loading={submitting}>
              {submitting ? 'Placing order...' : 'Place order securely'}
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
