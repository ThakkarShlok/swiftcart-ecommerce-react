import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/ui/Button';
import { getApiUrl, authHeaders, API_TOKEN } from '../api/apiConfig';
import AIReviewSummary from '../components/ui/AIReviewSummary';

const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
}).format(Number(price || 0));

const Stars = ({ value = 0 }) => (
  <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={star <= Math.round(value) ? 'text-copper-500' : 'text-ink-300'}>★</span>
    ))}
  </div>
);

// FIXED: ReviewsSection now accepts productName as a prop
const ReviewsSection = ({ 
  reviews, 
  loadingReviews, 
  averageRating, 
  totalReviews, 
  showReviewForm, 
  setShowReviewForm, 
  reviewName, 
  setReviewName, 
  reviewMessage, 
  setReviewMessage, 
  ratingNumber, 
  setRatingNumber, 
  hoveredStar, 
  setHoveredStar, 
  submittingReview, 
  handleReviewSubmit,
  productName  // ADD THIS - receive productName as prop
}) => (
  <section className="mt-12 rounded-[1.75rem] border border-ink-100 bg-surface-500 p-6 shadow-soft">
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="eyebrow">Social proof</p>
        <h2 className="mt-2 text-2xl font-bold text-ink-950">Customer reviews</h2>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-500">
          <Stars value={averageRating} />
          <span className="font-bold text-ink-950">{averageRating.toFixed(1)}</span>
          <span>({totalReviews} reviews)</span>
        </div>
      </div>
      {!showReviewForm && (
        <Button variant="secondary" onClick={() => setShowReviewForm(true)}>Write a review</Button>
      )}
    </div>

    {showReviewForm && (
      <form onSubmit={handleReviewSubmit} className="mb-8 rounded-[1.5rem] bg-surface-100 p-5">
        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold text-ink-700">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRatingNumber(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className={`text-2xl ${star <= (hoveredStar || ratingNumber) ? 'text-copper-500' : 'text-ink-300'}`}
                aria-label={`${star} star rating`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-ink-700">Name<input className="field mt-2" value={reviewName} onChange={(e) => setReviewName(e.target.value)} required /></label>
          <label className="text-sm font-bold text-ink-700 sm:col-span-2">Review<textarea rows={4} className="field mt-2" value={reviewMessage} onChange={(e) => setReviewMessage(e.target.value)} required /></label>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowReviewForm(false)}>Cancel</Button>
          <Button type="submit" loading={submittingReview}>Submit review</Button>
        </div>
      </form>
    )}

    {loadingReviews ? (
      <div className="grid gap-3">
        {[...Array(3)].map((_, index) => <div key={index} className="h-20 animate-pulse rounded-[1rem] bg-surface-200" />)}
      </div>
    ) : reviews.length === 0 ? (
      <div className="rounded-[1.5rem] bg-surface-100 p-8 text-center text-ink-500">No reviews yet. Be the first to share feedback.</div>
    ) : (
      <>
        <div className="divide-y divide-ink-100">
          {reviews.map((review, index) => (
            <article key={index} className="py-5 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-ink-950">{review.rating_name || 'Verified buyer'}</span>
                <Stars value={Number(review.rating_number || 0)} />
              </div>
              <p className="mt-2 text-sm leading-6 text-ink-500">{review.rating_message}</p>
            </article>
          ))}
        </div>
        
        {/* FIXED: AI Review Summary - Now properly placed and receives productName */}
        <AIReviewSummary 
          reviews={reviews} 
          productName={productName} 
        />
      </>
    )}
  </section>
);

const ProductDetail = ({ token = API_TOKEN, isLoggedIn, userId, onAddToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [ratingNumber, setRatingNumber] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  const ACTIVE_TOKEN = token || API_TOKEN;
  const LIST_PRODUCT_URL = getApiUrl('api-list-product.php');
  const ADD_WISHLIST_URL = getApiUrl('api-add-wishlist.php');
  const ADD_CART_URL = getApiUrl('api-add-cart.php');
  const LIST_RATING_URL = getApiUrl('api-list-rating.php');
  const ADD_RATING_URL = getApiUrl('api-add-rating.php');

  const getUserId = () => {
    if (isLoggedIn && userId) return userId;
    return '';
  };

  const fetchReviews = async () => {
    if (!id) return;

    setLoadingReviews(true);
    try {
      const payload = new FormData();
      payload.append('product_id', String(id));
      payload.append('user_id', getUserId() || '0');

      const res = await axios.post(LIST_RATING_URL, payload, {
        headers: authHeaders(ACTIVE_TOKEN),
      });

      if (res.data && String(res.data.flag) === '1') {
        setReviews(res.data.rate_list || []);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (!id) return;
        const payload = new FormData();
        const response = await axios.post(LIST_PRODUCT_URL, payload, {
          headers: authHeaders(ACTIVE_TOKEN),
        });
        if (response.data && String(response.data.flag) === '1') {
          const match = (response.data.product_list || []).find((item) => String(item.product_id) === String(id));
          setProduct(match || null);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Product detail fetch error:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id, ACTIVE_TOKEN, LIST_PRODUCT_URL, LIST_RATING_URL, isLoggedIn, userId]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, review) => sum + Number(review.rating_number || 0), 0) / reviews.length;
  }, [reviews]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    const activeUserId = getUserId();

    if (!activeUserId) {
      alert('Please login first to write a review.');
      navigate('/login');
      return;
    }

    if (!reviewName.trim() || !reviewMessage.trim() || ratingNumber === 0) {
      alert('Please fill in all review fields.');
      return;
    }

    setSubmittingReview(true);
    try {
      const payload = new FormData();
      payload.append('product_id', String(id));
      payload.append('user_id', activeUserId);
      payload.append('rating_number', String(ratingNumber));
      payload.append('rating_name', reviewName.trim());
      payload.append('rating_message', reviewMessage.trim());

      const res = await axios.post(ADD_RATING_URL, payload, {
        headers: authHeaders(ACTIVE_TOKEN),
      });

      if (String(res.data.flag) === '1') {
        alert(res.data.message || 'Review submitted successfully.');
        setReviewName('');
        setReviewMessage('');
        setRatingNumber(5);
        setHoveredStar(0);
        setShowReviewForm(false);
        fetchReviews();
      } else {
        alert(res.data.message || 'Failed to submit review.');
      }
    } catch (error) {
      console.error('Review submission error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToWishlist = async () => {
    const activeUserId = getUserId();
    if (!activeUserId) {
      alert('Please login first to add items to your wishlist.');
      navigate('/login');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('user_id', activeUserId);
      payload.append('product_id', String(id));

      const res = await axios.post(ADD_WISHLIST_URL, payload, {
        headers: authHeaders(ACTIVE_TOKEN),
      });

      if (String(res.data.flag) === '1') {
        alert(res.data.message || 'Added to wishlist.');
      } else {
        alert(res.data.message || 'Could not add item to wishlist.');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  const handleAddToCart = async () => {
    const activeUserId = getUserId();
    if (!activeUserId) {
      alert('Please login first to add items to your cart.');
      navigate('/login');
      return;
    }

    if (onAddToCart && product) {
      onAddToCart(product);
      return;
    }

    try {
      const payload = new FormData();
      payload.append('user_id', activeUserId);
      payload.append('product_id', String(id));
      payload.append('product_qty', '1');

      const res = await axios.post(ADD_CART_URL, payload, {
        headers: authHeaders(ACTIVE_TOKEN),
      });

      if (String(res.data.flag) === '1') {
        alert(res.data.message || 'Product added to cart.');
      } else {
        alert(res.data.message || 'Could not add item to cart.');
      }
    } catch (error) {
      console.error('Cart error:', error);
    }
  };

  if (loading) {
    return <div className="container-custom py-16"><div className="h-[520px] animate-pulse rounded-[1.5rem] bg-surface-200" /></div>;
  }

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold text-ink-950">Product not found</h1>
        <Link to="/products" className="mt-4 inline-flex font-bold text-copper-700 hover:text-copper-900">Back to products</Link>
      </div>
    );
  }

  const highlights = product.product_features || product.features || ['Fast delivery', 'Secure checkout', 'Easy returns'];
  const stock = product.product_stock || product.stock || 'Available';

  return (
    <div className="container-custom py-8">
      <Link to="/products" className="mb-5 inline-flex text-sm font-bold text-ink-600 hover:text-copper-700">Back to catalog</Link>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="card-surface overflow-hidden">
          <div className="bg-surface-200 p-4">
            <img
              src={product.product_image || product.image || ''}
              alt={product.product_name || 'Product'}
              className="aspect-square w-full rounded-[1.5rem] bg-white object-contain p-6"
            />
          </div>
        </section>

        <aside className="card-surface p-6 lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">{product.category_name || product.product_category || 'Product'} {product.sub_category_name ? `/ ${product.sub_category_name}` : ''}</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-ink-950 md:text-4xl">{product.product_name || 'Product details'}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-500">
            <Stars value={averageRating} />
            <span>{averageRating.toFixed(1)} rating</span>
            <span className="h-1 w-1 rounded-full bg-surface-300" />
            <span>{reviews.length} reviews</span>
          </div>

          <div className="mt-6 rounded-xl bg-surface-100 p-4">
            <div className="text-3xl font-black text-ink-950">{formatPrice(product.product_price || product.price)}</div>
            <p className="mt-1 text-sm text-ink-500">Inclusive of all taxes. Shipping calculated at checkout.</p>
          </div>

          <p className="mt-6 leading-7 text-ink-500">{product.product_details || product.product_description || product.description || 'No details available for this product.'}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button size="lg" onClick={handleAddToCart}>Add to cart</Button>
            <Button variant="secondary" size="lg" onClick={handleAddToWishlist}>Add to wishlist</Button>
          </div>
          {!isLoggedIn && <p className="mt-3 text-sm font-medium text-copper-700">Sign in to add this product to your cart or wishlist.</p>}

          <div className="mt-6 grid gap-3 rounded-xl border border-ink-100 p-4 text-sm text-ink-500">
            <p><span className="font-bold text-ink-950">Stock:</span> {stock}</p>
            <p><span className="font-bold text-ink-950">SKU:</span> {product.product_sku || product.sku || 'N/A'}</p>
            <p><span className="font-bold text-ink-950">Delivery:</span> {product.product_delivery || '2-4 business days'}</p>
          </div>
        </aside>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        {highlights.map((item, index) => (
          <div key={`${item}-${index}`} className="card-surface p-5">
            <p className="text-sm font-bold text-ink-950">{item}</p>
            <p className="mt-1 text-sm text-ink-500">Designed to reduce uncertainty before checkout.</p>
          </div>
        ))}
      </section>

      {/* FIXED: Pass productName to ReviewsSection */}
      <ReviewsSection
        reviews={reviews}
        loadingReviews={loadingReviews}
        averageRating={averageRating}
        totalReviews={reviews.length}
        showReviewForm={showReviewForm}
        setShowReviewForm={setShowReviewForm}
        reviewName={reviewName}
        setReviewName={setReviewName}
        reviewMessage={reviewMessage}
        setReviewMessage={setReviewMessage}
        ratingNumber={ratingNumber}
        setRatingNumber={setRatingNumber}
        hoveredStar={hoveredStar}
        setHoveredStar={setHoveredStar}
        submittingReview={submittingReview}
        handleReviewSubmit={handleReviewSubmit}
        productName={product?.product_name}  // ADD THIS - pass product name
      />
    </div>
  );
};

export default ProductDetail;