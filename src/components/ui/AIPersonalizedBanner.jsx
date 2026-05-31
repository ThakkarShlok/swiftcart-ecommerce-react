// src/components/ui/AIPersonalizedBanner.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { getApiUrl, authHeaders } from '../../api/apiConfig';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const GEMINI_MODEL = 'gemini-2.5-flash';

let ai = null;
if (GEMINI_API_KEY) {
  try { ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); }
  catch (e) { console.error('Gemini init failed:', e); }
}

// ── Fetch order history (mirrors OrdersView exactly) ─────────────────────────
const fetchOrderHistory = async (userId, token) => {
  const payload = new FormData();
  payload.append('user_id', userId);

  const res = await axios.post(getApiUrl('api-list-order.php'), payload, {
    headers: authHeaders(token),
  });

  if (res.data && String(res.data.flag) === '1') {
    return res.data.order_list || [];
  }
  return [];
};

// ── Gemini call ───────────────────────────────────────────────────────────────
const fetchPersonalizedBanner = async (userName, orders) => {
  if (!ai) throw new Error('Gemini not initialised');

  // Build a compact order summary — category/status only, no PII
  const orderSummary = orders
    .slice(0, 10)
    .map((o) =>
      `- Order #${o.order_id} | ₹${o.order_total || o.order_amount || '?'} | ${o.order_status || 'Pending'} | ${o.order_date || ''}`
    )
    .join('\n');

  const totalSpend = orders.reduce(
    (sum, o) => sum + Number(o.order_total || o.order_amount || 0), 0
  );
  const completedOrders = orders.filter(
    (o) => o.order_status?.toLowerCase() !== 'cancelled'
  ).length;

  const prompt = `You are writing a personalized homepage banner for ${userName || 'a returning customer'} on SwiftCart, an Indian e-commerce store.

Customer purchase history:
${orderSummary || 'No orders yet'}

Stats:
- Total orders: ${orders.length}
- Completed orders: ${completedOrders}
- Approximate total spend: ₹${totalSpend.toLocaleString('en-IN')}

Write a warm, personalized banner that:
- Welcomes them back by first name only
- References their purchase behavior (frequent buyer / occasional / new)
- Suggests what to explore next based on their history
- Feels human and genuine, not corporate

Keep it SHORT — headline max 8 words, subtitle max 15 words, cta max 4 words.

Reply ONLY with this JSON, no markdown, no other text:
{
  "headline": "...",
  "subtitle": "...",
  "cta_label": "...",
  "cta_path": "/shop" | "/products" | "/orders",
  "tier": "new" | "returning" | "loyal"
}`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      temperature: 0.7,
      maxOutputTokens: 256,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  let text = response.text;
  if (!text) throw new Error('Empty response from Gemini');
  text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON in response');

  return JSON.parse(text.slice(start, end + 1));
};

// ── Tier config — maps to SwiftCart palette ───────────────────────────────────
const TIER_CONFIG = {
  new: {
    bg: 'bg-surface-100 border border-ink-100',
    badge: 'bg-copper-50 text-copper-700 border border-copper-100',
    badgeLabel: '✦ Welcome',
  },
  returning: {
    bg: 'bg-surface-100 border border-ink-100',
    badge: 'bg-surface-200 text-ink-600 border border-ink-100',
    badgeLabel: '✦ Welcome back',
  },
  loyal: {
    bg: 'bg-ink-950',
    badge: 'bg-white/10 text-white border border-white/20',
    badgeLabel: '✦ Valued customer',
  },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const BannerSkeleton = () => (
  <div className="rounded-[1.5rem] border border-ink-100 bg-surface-100 p-6 sm:p-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-3 flex-1">
        <div className="h-4 w-24 animate-pulse rounded-full bg-surface-200" />
        <div className="h-7 w-3/4 animate-pulse rounded-full bg-surface-200" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-surface-200" />
      </div>
      <div className="h-10 w-32 animate-pulse rounded-2xl bg-surface-200 shrink-0" />
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const AIPersonalizedBanner = ({ isLoggedIn, userData, token }) => {
  const [banner, setBanner]   = useState(null);
  const [loading, setLoading] = useState(false);
  const fetchedRef            = useRef(false); // single-call guard

  useEffect(() => {
    // Only run for logged-in users, only once per mount
    if (!isLoggedIn || !userData?.user_id || fetchedRef.current) return;
    fetchedRef.current = true;

    const run = async () => {
      setLoading(true);
      try {
        const orders = await fetchOrderHistory(userData.user_id, token);
        const result = await fetchPersonalizedBanner(userData.user_name, orders);
        setBanner({ ...result, orderCount: orders.length });
      } catch (err) {
        console.error('Personalized banner error:', err);
        // Fail silently — generic hero still shows below this component
      } finally {
        setLoading(false);
      }
    };

    run();
    // Single stable dependency — user ID only. fetchedRef prevents re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.user_id]);

  // Don't render anything for guests — generic hero handles that
  if (!isLoggedIn) return null;

  if (loading) return <BannerSkeleton />;

  // If Gemini failed, render nothing — generic hero still shows
  if (!banner) return null;

  const tier   = TIER_CONFIG[banner.tier] ?? TIER_CONFIG.returning;
  const isLoyal = banner.tier === 'loyal';

  return (
    <div className={`rounded-[1.5rem] p-6 sm:p-8 ${tier.bg}`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          {/* Tier badge */}
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tier.badge}`}>
            {tier.badgeLabel}
          </span>

          {/* AI-generated headline */}
          <h2 className={`text-2xl font-black leading-tight sm:text-3xl ${isLoyal ? 'text-white' : 'text-ink-950'}`}>
            {banner.headline}
          </h2>

          {/* AI-generated subtitle */}
          <p className={`text-sm leading-relaxed ${isLoyal ? 'text-white/70' : 'text-ink-500'}`}>
            {banner.subtitle}
          </p>

          {/* Order count pill — only if they have orders */}
          {banner.orderCount > 0 && (
            <p className={`text-xs font-medium ${isLoyal ? 'text-white/50' : 'text-ink-400'}`}>
              {banner.orderCount} order{banner.orderCount !== 1 ? 's' : ''} with us
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Link
            to={banner.cta_path || '/shop'}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition
              ${isLoyal
                ? 'bg-white text-ink-950 hover:bg-copper-50'
                : 'bg-ink-950 text-white hover:bg-copper-600'
              }`}
          >
            {banner.cta_label}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          {/* Quick link to orders if they have any */}
          {banner.orderCount > 0 && (
            <Link to="/orders" className={`text-xs font-medium underline-offset-2 hover:underline ${isLoyal ? 'text-white/60 hover:text-white' : 'text-ink-400 hover:text-ink-600'}`}>
              View order history
            </Link>
          )}
        </div>
      </div>

      {/* Subtle AI attribution */}
      <p className={`mt-4 border-t pt-3 text-[11px] ${isLoyal ? 'border-white/10 text-white/30' : 'border-ink-100 text-ink-300'}`}>
        ✦ Personalised for you by Gemini AI
      </p>
    </div>
  );
};

export default AIPersonalizedBanner;
