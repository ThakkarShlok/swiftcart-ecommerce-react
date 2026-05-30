// src/components/ui/AICartUpsell.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import Button from './Button';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const GEMINI_MODEL = 'gemini-2.5-flash';

let ai = null;
if (GEMINI_API_KEY) {
  try { ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); }
  catch (e) { console.error('Gemini init failed:', e); }
}

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0,
  }).format(Number(price || 0));

// ── Gemini call ──────────────────────────────────────────────────────────────
const fetchUpsellSuggestions = async (cartItems, allProducts) => {
  if (!ai) throw new Error('Gemini not initialised');

  const cartSummary = cartItems
    .map((i) => `- ${i.product_name} (${i.product_category_name ?? i.category ?? 'General'})`)
    .join('\n');

  const cartIds = new Set(cartItems.map((i) => String(i.product_id)));

  // ✅ FIX 2: Cap candidates at 20 (not 80) — keeps prompt small,
  // prevents truncation, and reduces tokens consumed by the thinking model.
  // 20 products is more than enough for 3 good recommendations.
  const candidates = allProducts
    .filter((p) => !cartIds.has(String(p.product_id)))
    .slice(0, 20)
    .map((p, idx) => `${idx + 1}. id=${p.product_id} | ${p.product_name} | ${p.product_category_name ?? p.category ?? 'General'}`)
    .join('\n');

  if (!candidates.trim()) throw new Error('No candidate products available');

  // Compact single-line JSON format in the example reduces output tokens further
  const prompt = `Cart items:
${cartSummary}

Products to pick from:
${candidates}

Choose 3 products that best complement the cart. Reply ONLY with this JSON, no other text:
[{"product_id":"ID","reason":"max 5 words"},{"product_id":"ID","reason":"max 5 words"},{"product_id":"ID","reason":"max 5 words"}]`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    // ✅ FIX 2b: 512 is enough for 3 short JSON objects.
    // The thinking model uses its own internal budget separately.
    config: { temperature: 0.3, maxOutputTokens: 512 },
  });

  let text = response.text;
  if (!text) throw new Error('Empty response from Gemini');
  text = text.trim();
  console.log('Upsell raw response:', text);

  text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  const start = text.indexOf('[');
  const end   = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`No JSON array found. Response was: ${text.substring(0, 120)}`);
  }

  const parsed = JSON.parse(text.slice(start, end + 1));

  return parsed
    .map((s) => {
      const product = allProducts.find((p) => String(p.product_id) === String(s.product_id));
      if (!product) {
        console.warn(`Upsell: product_id "${s.product_id}" not in catalogue`);
        return null;
      }
      return { product, reason: s.reason };
    })
    .filter(Boolean)
    .slice(0, 3);
};

// ── Sub-components ────────────────────────────────────────────────────────────
const SparkleIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const SuggestionCard = ({ product, reason, onAddToCart }) => {
  const [imgError, setImgError] = useState(false);
  const [added, setAdded]       = useState(false);

  const handleAdd = async () => {
    await onAddToCart?.(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <article className="card-surface flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-copper-100 hover:shadow-soft">
      <Link to={`/product/${product.product_id}`} className="block bg-surface-100">
        {!imgError ? (
          <img
            src={product.product_image}
            alt={product.product_name}
            onError={() => setImgError(true)}
            className="aspect-[4/3] w-full object-contain p-4"
          />
        ) : (
          <div className="aspect-[4/3] grid place-items-center text-sm text-ink-400">No image</div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 gap-3">
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-copper-50 px-2.5 py-1 text-[11px] font-semibold text-copper-700">
          <SparkleIcon /> {reason}
        </span>
        <Link to={`/product/${product.product_id}`}>
          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-ink-950 hover:text-copper-600 transition-colors">
            {product.product_name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-base font-black text-ink-950">{formatPrice(product.product_price)}</span>
          <Button size="sm" variant={added ? 'secondary' : 'primary'} onClick={handleAdd}>
            {added ? '✓ Added' : 'Add to cart'}
          </Button>
        </div>
      </div>
    </article>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const AICartUpsell = ({ cartItems, allProducts, onAddToCart }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  // ✅ FIX 1: Store latest props in refs so the useEffect closure always
  // has fresh values WITHOUT needing them in the dependency array.
  // This is the standard React pattern to avoid stale closures while
  // also preventing the effect from re-running on every render.
  const cartItemsRef    = useRef(cartItems);
  const allProductsRef  = useRef(allProducts);
  const onAddToCartRef  = useRef(onAddToCart);

  useEffect(() => { cartItemsRef.current   = cartItems;   }, [cartItems]);
  useEffect(() => { allProductsRef.current = allProducts; }, [allProducts]);
  useEffect(() => { onAddToCartRef.current = onAddToCart; }, [onAddToCart]);

  // ✅ FIX 1b: The key that gates the Gemini call — derived from cart product IDs.
  // We compare the previous key to the new one in the effect, and only
  // call Gemini when the cart actually changes (items added/removed).
  const prevCartKeyRef = useRef('');

  useEffect(() => {
    // Wait until we have both cart items and a product catalogue
    if (!cartItems?.length || !allProducts?.length) return;

    const cartKey = cartItems.map((i) => i.product_id).sort().join(',');

    // ✅ FIX 1c: Guard using the derived cart key string — a stable primitive,
    // not the array reference — so this truly fires only when cart contents change.
    if (prevCartKeyRef.current === cartKey) return;
    prevCartKeyRef.current = cartKey;

    const run = async () => {
      setLoading(true);
      setError(null);
      setSuggestions([]);
      try {
        // Use refs here so we always have the latest allProducts even if
        // the component re-rendered while the async call was in flight
        const result = await fetchUpsellSuggestions(
          cartItemsRef.current,
          allProductsRef.current,
        );
        if (result.length === 0) {
          setError('No complementary products found.');
        } else {
          setSuggestions(result);
        }
      } catch (err) {
        console.error('Upsell error:', err);
        setError('Could not load suggestions right now.');
      } finally {
        setLoading(false);
      }
    };

    run();

    // ✅ FIX 1d: Dependency array uses only the stable primitive cartKey string,
    // NOT the cartItems/allProducts arrays whose references change every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems?.map((i) => i.product_id).sort().join(',')]);

  if (!cartItems?.length) return null;

  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">AI recommendations</p>
          <h2 className="mt-1 text-2xl font-bold text-ink-950">Complete your order</h2>
          <p className="mt-1 text-sm text-ink-500">Picked for you based on what's in your cart.</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-2xl border border-ink-100 bg-surface-100 px-3 py-1.5 text-xs font-semibold text-ink-500">
          <SparkleIcon /> Powered by Gemini AI
        </span>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-surface overflow-hidden">
              <div className="aspect-[4/3] animate-pulse bg-surface-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-surface-200" />
                <div className="h-4 w-full animate-pulse rounded-full bg-surface-200" />
                <div className="h-8 w-full animate-pulse rounded-2xl bg-surface-200" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[1.5rem] border border-ink-100 bg-surface-100 px-5 py-4 text-sm text-ink-500">
          ⚠️ {error}
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {suggestions.map(({ product, reason }) => (
            <SuggestionCard
              key={product.product_id}
              product={product}
              reason={reason}
              onAddToCart={onAddToCartRef.current}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default AICartUpsell;
