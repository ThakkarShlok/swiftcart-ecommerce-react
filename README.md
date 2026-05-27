# SwiftCart — E-Commerce App (React)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat-square&logo=axios&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)

A React e-commerce app covering the full shopping flow — product browsing, cart, wishlist, checkout, order tracking, and a dual auth system (password + OTP). Connected to a live REST API backend with 20 endpoints across auth, products, cart, orders, and reviews.

---

## What the app does

- Browse products, filter by price range, sort low-to-high or high-to-low, search by name
- View product detail with customer reviews and a 5-star rating system
- Add to cart or wishlist (both require login)
- Cart with quantity controls and a live grand total, synced to the backend
- Checkout with shipping details + payment method selection (COD / Card / UPI)
- Order history with expandable line-item details and order cancellation
- Two login options: email + password, or OTP on mobile number
- Auth-aware navbar — shows your name and order tracking link when logged in
- Protected routes — Cart, Checkout, Orders redirect you to home if you're not logged in

---

## Tech Stack

| Framework | React 19 |
| Build tool | Vite 8 |
| Routing | React Router v7 |
| HTTP | Axios |
| Language | JavaScript (ES Modules) |
| Linting | ESLint with react-hooks plugin |
| Env config | `.env` with `VITE_` prefix |

---

## Project Structure

```
src/
├── api/
│   └── apiConfig.js        # BASE_URL, API_TOKEN, getApiUrl(), authHeaders()
├── components/
│   ├── Layout.jsx           # Shared navbar + footer, renders <Outlet />
│   ├── CategoryList.jsx
│   ├── SubcategoryList.jsx
│   └── ProductDisplay.jsx
├── pages/
│   ├── HomeView.jsx         # Hero banner + featured products grid
│   ├── ProductsView.jsx     # Full product listing with search
│   ├── ShopView.jsx         # Products + sidebar price/sort filters
│   ├── ProductDetail.jsx    # Product info, cart/wishlist actions, reviews
│   ├── CartView.jsx         # Cart CRUD + grand total
│   ├── WishlistView.jsx
│   ├── CheckoutView.jsx     # Shipping form + order confirmation screen
│   ├── OrdersView.jsx       # Order history, expandable details, cancel
│   ├── UserLogin.jsx
│   ├── UserRegistration.jsx
│   ├── LoginWithOtp.jsx     # Step 1 of OTP flow
│   ├── VerifyOtp.jsx        # Step 2 of OTP flow
│   ├── AboutUs.jsx
│   ├── ContactUs.jsx
│   └── NotFound.jsx
├── App.jsx                  # Route tree + global auth/product state
└── main.jsx
```

---

## A few implementation details worth noting

**API config is centralized.** Instead of copy-pasting the base URL across files, I have a single `apiConfig.js` that exports `getApiUrl(path)` and `authHeaders(token)`. Every component imports from there. If the base URL changes, I update it in one place.

**OTP login uses React Router's `location.state`** to pass the mobile number and OTP between the two pages. `VerifyOtp` also checks if `location.state` is missing and redirects back — so you can't land on `/verify-otp` directly without going through the OTP request step first.

**Order details are fetched lazily.** On the Orders page, clicking "View Details" on an order fetches its line items on demand. If you've already expanded an order, clicking again just collapses it — no repeat API call.

**Filtering and sorting in ShopView** happens entirely on the client. The full product list comes from one API call on mount, and the visible items are computed with `.filter().sort()` on every render based on the current price range, sort order, and search query.

**Session persists across refreshes** using `localStorage`. On mount, `App.jsx` reads `stored_user_id` and `stored_user_name` and restores auth state. Logout clears both.

---

## API Integration

The backend was designed and built by **Akash Sir (Akash Technolabs)**. I integrated 20 REST endpoints from the frontend side — auth, products, categories, cart, wishlist, orders, ratings. All requests are `POST` with `FormData` and a Bearer token in the header.

The base URL and token are stored in a `.env` file that's excluded from the repo. A `.env.example` is included so anyone cloning the project knows what variables are needed.

```env
VITE_API_BASE_URL=https://your-api-base-url.example.com
VITE_API_TOKEN=your_api_token_here
```

**Note:** The backend is part of the training institute's infrastructure and isn't publicly accessible. The frontend code — components, routing, state, API calls — is all mine and is fully readable in this repo.

### Endpoints used

| Endpoint | What it does |
|---|---|
| `api-list-product.php` | All products |
| `api-list-category.php` | Categories |
| `api-subcategory-list.php` | Subcategories |
| `api-user-register.php` | Register |
| `api-login.php` | Login (email + password) |
| `api-otp-login.php` | Send OTP |
| `api-otp-verify.php` | Verify OTP |
| `api-add-cart.php` | Add to cart |
| `api-list-cart.php` | Get cart |
| `api-update-cart.php` | Update quantity |
| `api-delete-cart.php` | Remove from cart |
| `api-add-wishlist.php` | Add to wishlist |
| `api-list-wishlist.php` | Get wishlist |
| `api-delete-wishlist.php` | Remove from wishlist |
| `api-add-order.php` | Place order |
| `api-list-order.php` | Order history |
| `api-list-order-detail.php` | Order line items |
| `api-order-cancel.php` | Cancel order |
| `api-list-rating.php` | Get reviews |
| `api-add-rating.php` | Submit review |

---

## Setup

```bash
git clone https://github.com/ThakkarShlok/swiftcart-ecommerce-react.git
cd swiftcart-ecommerce-react
npm install
cp .env.example .env
# fill in VITE_API_BASE_URL and VITE_API_TOKEN
npm run dev
```

Runs on `http://localhost:5173`.

```bash
npm run build    # production build → /dist
npm run preview  # preview the build locally
```

---

## Future Enhancements

Right now, global state (auth, product list) lives in `App.jsx` and gets passed down as props. It works fine at this size but doesn't scale well — I'm currently learning Redux Toolkit and plan to migrate it.

Other things on the list:
- Replace inline styles with Tailwind CSS or CSS Modules
- Replace `alert()` calls with a toast library
- Add TypeScript
- Write some tests with React Testing Library
- Deploy to Vercel and add a live demo link here
- Build my own backend once I've learned Node.js/Express



## Acknowledgements

Thanks to **Akash Sir at Akash Technolabs, Gujarat** for teaching React and frontend engineering, building the backend APIs that made this a real data-driven project, and for the overall structure of the training.

---

**Shlok Thakkar** — CE Student, Year 2, Gujarat
[![GitHub](https://img.shields.io/badge/GitHub-ThakkarShlok-181717?style=flat-square&logo=github)](https://github.com/ThakkarShlok)
