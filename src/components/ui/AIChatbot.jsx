// src/components/ui/AIChatbot.jsx
import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const GEMINI_MODEL = 'gemini-2.5-flash';

let ai = null;
if (GEMINI_API_KEY) {
  try { ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); }
  catch (e) { console.error('Gemini init failed:', e); }
}

const buildCatalogueContext = (products) => {
  if (!products?.length) return 'No products available right now.';
  return products
    .slice(0, 60)
    .map((p) => `- ${p.product_name} | ₹${p.product_price ?? p.product_cost ?? '?'} | ${p.product_category_name ?? p.category ?? 'General'}`)
    .join('\n');
};

const buildSystemPrompt = (products, isLoggedIn, userName) => {
  const catalogue = buildCatalogueContext(products);
  const userCtx = isLoggedIn && userName
    ? `The user is logged in as "${userName}".`
    : 'The user is browsing as a guest.';
  return `You are Swift, a friendly and knowledgeable shopping assistant for SwiftCart — an Indian e-commerce store.
${userCtx}

Your job:
- Help users find products from the catalogue below
- Answer questions about pricing, categories, shipping, returns, and checkout
- Suggest relevant products based on what the user describes
- Keep replies short, friendly, and helpful — max 3-4 sentences
- Always respond in Indian context (₹ for prices, India shipping)
- If a product isn't in the catalogue, say so honestly
- Never make up prices or product details

Store policies:
- Free shipping on orders above ₹999
- 30-day easy returns
- Secure checkout with encrypted payments
- Support email: support@swiftcart.com

Current product catalogue:
${catalogue}`;
};

// Spinner that matches the existing AIReviewSummary spinner style
const Spinner = () => (
  <div className="flex items-center gap-3">
    <div className="w-4 h-4 border-2 border-copper-500 border-t-transparent rounded-full animate-spin" />
    <span className="text-sm text-ink-500">Swift is thinking…</span>
  </div>
);

const QUICK_REPLIES = [
  'What are your best deals?',
  'Do you have electronics?',
  'How do I track my order?',
  'What is your return policy?',
];

const AIChatbot = ({ products = [], isLoggedIn = false, userData = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi${userData?.user_name ? ` ${userData.user_name}` : ''}! 👋 I'm Swift, your shopping assistant. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const historyRef = useRef([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  // Reset on user change
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `Hi${userData?.user_name ? ` ${userData.user_name}` : ''}! 👋 I'm Swift, your shopping assistant. How can I help you today?`,
    }]);
    historyRef.current = [];
  }, [userData?.user_id]);

  const sendMessage = async (text) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    const newHistory = [
      ...historyRef.current,
      { role: 'user', parts: [{ text: userText }] },
    ];

    try {
      if (!ai) throw new Error('Gemini not initialised');
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: newHistory,
        config: {
          systemInstruction: buildSystemPrompt(products, isLoggedIn, userData?.user_name),
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      });

      const replyText = response.text?.trim() || 'Sorry, I could not understand that. Could you rephrase?';
      historyRef.current = [
        ...newHistory,
        { role: 'model', parts: [{ text: replyText }] },
      ];
      setMessages((prev) => [...prev, { role: 'assistant', content: replyText }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I ran into an issue. Please try again in a moment.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const showQuickReplies = messages.length === 1;

  return (
    <>
      <style>{`
        @keyframes swiftSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes swiftDot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.75); }
          40%            { opacity: 1;    transform: scale(1); }
        }
        .swift-window { animation: swiftSlideUp 0.2s ease-out; }
        .swift-dot { animation: swiftDot 1.2s infinite; }
      `}</style>

      {/* ── Chat window ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="SwiftCart AI Shopping Assistant"
          className="swift-window fixed bottom-20 right-4 z-50 flex flex-col overflow-hidden rounded-[1.5rem] border border-ink-100 bg-white shadow-soft"
          style={{ width: 340, maxWidth: 'calc(100vw - 32px)', maxHeight: 'min(540px, calc(100vh - 110px))' }}
        >
          {/* Header — ink-950 bg matches the top announcement bar */}
          <div className="flex shrink-0 items-center gap-3 bg-ink-950 px-4 py-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-copper-500 text-sm font-bold text-white">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-none">Swift</p>
              <p className="mt-0.5 text-[11px] text-ink-300 leading-none">
                {loading ? 'Typing…' : 'AI Shopping Assistant · Online'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="grid h-7 w-7 place-items-center rounded-xl bg-white/10 text-ink-300 transition hover:bg-white/20 hover:text-white text-sm"
            >✕</button>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4 gap-2">
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div key={i} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {/* Avatar — only for assistant */}
                  {!isUser && (
                    <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-copper-500 text-[11px] font-bold text-white mb-0.5">
                      S
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words
                      ${isUser
                        ? 'rounded-br-sm bg-copper-500 text-white'
                        : 'rounded-bl-sm border border-ink-100 bg-surface-100 text-ink-950'
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-copper-500 text-[11px] font-bold text-white mb-0.5">S</div>
                <div className="rounded-2xl rounded-bl-sm border border-ink-100 bg-surface-100 px-3 py-2.5 flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="swift-dot block h-1.5 w-1.5 rounded-full bg-ink-400" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick reply chips */}
            {showQuickReplies && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="rounded-2xl border border-ink-100 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:border-copper-200 hover:bg-copper-50 hover:text-copper-700"
                  >{q}</button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div className="shrink-0 border-t border-ink-100 bg-white px-3 py-3 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything…"
              rows={1}
              disabled={loading}
              aria-label="Chat message input"
              className="field flex-1 resize-none py-2 min-h-[38px] max-h-20 text-sm"
              style={{ lineHeight: '1.45' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className={`mb-px grid h-9 w-9 shrink-0 place-items-center rounded-2xl text-sm font-bold transition
                ${loading || !input.trim()
                  ? 'bg-surface-200 text-ink-400 cursor-not-allowed'
                  : 'bg-copper-500 text-white hover:bg-copper-600 shadow-sm shadow-copper-700/20'
                }`}
            >➤</button>
          </div>
        </div>
      )}

      {/* ── Floating trigger button — matches .btn-primary pattern ── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close AI shopping assistant' : 'Open AI shopping assistant'}
        aria-expanded={isOpen}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-2xl bg-copper-500 text-white shadow-sm shadow-copper-700/30 transition hover:bg-copper-600 focus:outline-none focus:ring-4 focus:ring-copper-500/25 grid place-items-center text-xl"
      >
        {isOpen ? '✕' : '✦'}
      </button>
    </>
  );
};

export default AIChatbot;
