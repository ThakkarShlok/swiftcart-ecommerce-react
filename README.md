# 🛒 SwiftCart — AI-Enabled E-Commerce Platform

A full-stack, AI-powered e-commerce web application built with React 19 and Vite. SwiftCart combines a responsive storefront, an AI shopping assistant, and a secure serverless payment layer — designed and built end-to-end as a solo project.

> **Live demo:** [ai-enabled-ecommerce-app.vercel.app](https://ai-enabled-ecommerce-app.vercel.app)
> **Author:** Shlok Thakkar · [GitHub](https://github.com/ThakkarShlok) · [LinkedIn](https://www.linkedin.com/in/shlok-thakkar-58a033354)

---

## 📋 Overview

SwiftCart is a multi-page storefront that connects to an external REST API backend for catalog, cart, and order data, while adding two layers of original engineering on top: a set of AI features powered by Google Gemini, and a self-built serverless payment system using Razorpay — deployed on Vercel without modifying the existing backend.

The backend catalog/cart/order APIs and infrastructure are provided by Akash Sir (Akash Technolabs). The AI integration, payment layer, serverless functions, and frontend are done by me(Shlok Thakkar)

---

## ✨ Features

**Storefront**
- Responsive product catalog, product detail pages, and real-time client-side search
- Cart management with quantity controls and a free-shipping threshold
- Wishlist support
- User authentication — both email/password and mobile OTP flows
- Order history with persisted sessions across refreshes

**AI (Google Gemini)**
- 🤖 AI shopping assistant chatbot
- 🛍️ Intelligent cart upsell recommendations
- 📝 AI-generated review summaries
- 💰 AI pricing explainer
- 🎯 Personalized homepage banner

**Payments & Notifications**
- 🔒 Secure Razorpay checkout via Vercel serverless functions — the secret key never reaches the browser
- ✅ Server-side HMAC-SHA256 payment signature verification
- 🔔 Razorpay webhook receiver with signature verification and idempotency handling
- 📧 Automated order-confirmation emails with an itemized receipt (EmailJS)
- 🧾 Downloadable PDF invoices (jsPDF)
- 💬 WhatsApp order-details deep link

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 (functional components & hooks) |
| Build tool | Vite |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v3 |
| HTTP client | Axios (FormData payloads) |
| AI | Google Gemini (`@google/genai`) |
| Payments | Razorpay + Vercel serverless functions |
| Email | EmailJS |
| PDF | jsPDF |
| Hosting | Vercel |

---

## 🏗️ Architecture Highlights

**Serverless payment layer.** Rather than modifying the existing backend, payments run through three self-contained Vercel serverless functions: `create-order` (creates a Razorpay order server-side), `verify-payment` (verifies the HMAC signature so a tampered payment can't pass), and `razorpay-webhook` (a server-to-server receiver with signature verification and an idempotency guard so duplicate events are handled exactly once). The Razorpay secret key lives only in server-side environment variables and is never bundled into the client.

**External API integration.** Catalog, cart, and order operations interface with an external PHP backend via Axios POST requests. Because the API expects structured input, client data is bundled into `FormData` before transmission. All network calls use `async/await` wrapped in `try/catch/finally` for graceful loading and error states.

**Local development.** Because `vercel dev` had cross-process issues on Windows, the project includes a lightweight local API server (`api/local-server.mjs`) that runs the same serverless handler files Vite proxies to — keeping local and production behavior identical.

**Route protection.** Private views (`/cart`, `/checkout`, `/orders`) are guarded and check `localStorage` on mount to persist sessions across refreshes.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Razorpay account (test keys are fine for development)

### Installation

```bash
# Clone the repo
git clone https://github.com/ThakkarShlok/<your-repo>.git
cd <your-repo>

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root. See `.env.example` for all keys.

**Client-side (safe to expose, `VITE_` prefix):**
```env
VITE_API_BASE_URL=http://your-api-link/api
VITE_API_TOKEN=your_backend_token
VITE_GEMINI_API_KEY=your_gemini_key
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
VITE_PAYMENT_PROXY_URL=
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

**Server-side only (NO `VITE_` prefix — set in Vercel dashboard / `.env.local`):**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

> ⚠️ The `VITE_` prefix is the security boundary: prefixed variables are bundled into the browser; unprefixed ones stay server-side. The Razorpay secret must never have a `VITE_` prefix.

### Running Locally

Two terminals:

```bash
# Terminal 1 — local API server (serverless functions)
node api/local-server.mjs

# Terminal 2 — Vite dev server
npm run dev
```

Then open `http://localhost:5173`.

---

## 📦 Deployment

The app deploys to Vercel. Frontend and `/api` serverless functions live on the same domain, so the client uses relative URLs and no CORS or proxy config is needed in production. All environment variables (both client and server) must be added in the Vercel project settings.

---

## 📝 A Note on Metrics

Any statistics shown in the UI (customer counts, ratings) are illustrative placeholders for design purposes — this is a portfolio project, not a live commercial store.

---

## 🙏 Acknowledgements

- Backend catalog/cart/order APIs by **Akash Sir (Akash Technolabs)**
- AI features powered by **Google Gemini**
- Payments by **Razorpay**

---

*Built by Shlok Thakkar, 2026.*