// src/components/ui/AIPricingExplainer.jsx
import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const GEMINI_MODEL = 'gemini-2.5-flash';

let ai = null;
if (GEMINI_API_KEY) {
  try { ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); }
  catch (e) { console.error('Gemini init failed:', e); }
}

// ── Gemini call ──────────────────────────────────────────────────────────────
const fetchPricingExplanation = async (product) => {
  if (!ai) throw new Error('Gemini not initialised');

  const price = Number(product.product_price || product.price || 0);
  const name = product.product_name || 'this product';
  const category = product.category_name || product.product_category || 'General';
  const subCategory = product.sub_category_name ? ` / ${product.sub_category_name}` : '';
  const description = product.product_details || product.product_description || product.description || '';
  const sku = product.product_sku || product.sku || '';
  const delivery = product.product_delivery || '2-4 business days';

  const prompt = `You are a pricing analyst for an Indian e-commerce store called SwiftCart.

Product details:
- Name: ${name}
- Category: ${category}${subCategory}
- Price: ₹${price.toLocaleString('en-IN')}
- SKU: ${sku}
- Delivery: ${delivery}
- Description: ${description.substring(0, 200)}

Write a short, confident pricing justification for this product — why is this price fair and reasonable?
Focus on: value for money, category positioning, quality indicators from the name/description, and what the buyer gets.
Keep it factual and helpful, not salesy.

Reply ONLY with this JSON, no markdown, no other text:
{
  "verdict": "fair" | "great_value" | "premium",
  "headline": "one short punchy line (max 8 words)",
  "reasons": ["reason 1", "reason 2", "reason 3"],
  "value_tip": "one sentence tip on how to maximise value from this purchase"
}`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      temperature: 0.3,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  let text = response.text;
  if (!text) throw new Error('Empty response from Gemini');
  text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object in response');

  const result = JSON.parse(text.slice(start, end + 1));
  console.log('Pricing explainer result:', result);
  return result;
};

// ── Verdict config ────────────────────────────────────────────────────────────
const VERDICT_CONFIG = {
  great_value: {
    label: '✦ Great Value',
    classes: 'bg-copper-50 text-copper-700 border-copper-100',
  },
  fair: {
    label: '✓ Fair Price',
    classes: 'bg-surface-200 text-ink-600 border-ink-100',
  },
  premium: {
    label: '◆ Premium Pick',
    classes: 'bg-ink-950 text-white border-ink-950',
  },
};

// ── Main component ────────────────────────────────────────────────────────────
const AIPricingExplainer = ({ product }) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [isExpanded, setIsExpanded]   = useState(false);

  const handleToggle = async () => {
    const next = !isExpanded;
    setIsExpanded(next);

    // Lazy — only call Gemini once, on first expand
    if (next && !explanation && !loading) {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPricingExplanation(product);
        setExplanation(result);
      } catch (err) {
        console.error('Pricing explainer error:', err);
        setError('Could not analyse pricing right now.');
      } finally {
        setLoading(false);
      }
    }
  };

  const verdict = explanation
    ? (VERDICT_CONFIG[explanation.verdict] ?? VERDICT_CONFIG.fair)
    : null;

  return (
    <div>
      {/* Pill button — clearly visible inside the price card */}
      <button
        onClick={handleToggle}
        className="inline-flex w-full items-center justify-between gap-2 rounded-lg border border-copper-100 bg-white px-3 py-2 text-sm font-semibold text-copper-700 transition hover:bg-copper-50 hover:border-copper-200"
        aria-expanded={isExpanded}
      >
        <span className="inline-flex items-center gap-2">
          <span>✦</span>
          Why is this price fair?
        </span>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-2 rounded-xl border border-ink-100 bg-white p-4">
          {loading ? (
            // Spinner — identical to AIReviewSummary
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-copper-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-ink-500">Analysing price with AI…</span>
            </div>

          ) : error ? (
            <p className="text-sm text-ink-500">
              <span>⚠️</span> {error}
            </p>

          ) : explanation ? (
            <div className="space-y-3">
              {/* Header row: verdict badge + headline */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${verdict.classes}`}>
                  {verdict.label}
                </span>
                <p className="text-sm font-bold text-ink-950">{explanation.headline}</p>
              </div>

              {/* Reasons list */}
              {explanation.reasons?.length > 0 && (
                <ul className="space-y-1.5">
                  {explanation.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
                      <span className="mt-0.5 text-copper-500 text-xs shrink-0">✓</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              )}

              {/* Value tip */}
              {explanation.value_tip && (
                <div className="rounded-lg border border-ink-100 bg-white px-3 py-2.5 text-xs text-ink-500 leading-relaxed">
                  <span className="font-semibold text-ink-700">💡 Tip: </span>
                  {explanation.value_tip}
                </div>
              )}

              <p className="text-[11px] text-ink-400 pt-1 border-t border-ink-100">
                ✦ AI-generated price analysis · For informational purposes only
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AIPricingExplainer;
