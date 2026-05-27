// src/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, authHeaders, API_TOKEN } from '../api/apiConfig';

const ProductDetail = ({ onAddToCart, isLoggedIn, userId }) => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Reviews & Ratings State ---
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Form Fields State
  const [reviewName, setReviewName] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [ratingNumber, setRatingNumber] = useState(5); // Default 5 stars
  const [hoveredStar, setHoveredStar] = useState(0);

  // API Endpoints
  const LIST_PRODUCT_URL = getApiUrl('api-list-product.php');
  const ADD_WISHLIST_URL = getApiUrl('api-add-wishlist.php');
  const ADD_CART_URL = getApiUrl('api-add-cart.php');
  
  // Rating APIs from Postman images
  const LIST_RATING_URL = getApiUrl('api-list-rating.php');
  const ADD_RATING_URL = getApiUrl('api-add-rating.php');

  const ACTIVE_TOKEN = API_TOKEN;

  // Get logged in user ID securely
  const getUserId = () => {
    if (isLoggedIn && userId) return userId;
    return "";
  };

  // 1. Fetch Product Details
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const formData = new FormData();
        const config = { headers: authHeaders(ACTIVE_TOKEN) };
        const res = await axios.post(LIST_PRODUCT_URL, formData, config);

        if (res.data && String(res.data.flag) === "1") {
          const match = res.data.product_list.find(item => String(item.product_id) === String(id));
          setProduct(match || null);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  // 2. Fetch Product Reviews (api-list-rating.php)
  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const userId = getUserId();
      const payload = new FormData();
      payload.append('product_id', String(id));
      payload.append('user_id', userId || "0"); // Send 0 if user is not logged in

      const config = { headers: authHeaders(ACTIVE_TOKEN) };
      const res = await axios.post(LIST_RATING_URL, payload, config);

      if (res.data && String(res.data.flag) === "1") {
        setReviews(res.data.rate_list || []);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  // 3. Submit New Review (api-add-rating.php)
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const userId = getUserId();

    if (!userId) {
      alert("Please login first to write a review.");
      navigate('/login');
      return;
    }

    if (!reviewName.trim() || !reviewMessage.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    setSubmittingReview(true);
    try {
      const payload = new FormData();
      payload.append('product_id', String(id));
      payload.append('user_id', userId);
      payload.append('rating_number', String(ratingNumber));
      payload.append('rating_name', reviewName.trim());
      payload.append('rating_message', reviewMessage.trim());

      const config = { headers: authHeaders(ACTIVE_TOKEN) };
      const res = await axios.post(ADD_RATING_URL, payload, config);

      if (String(res.data.flag) === "1") {
        alert(res.data.message || "Review submitted successfully!");
        // Clear form
        setReviewName('');
        setReviewMessage('');
        setRatingNumber(5);
        setShowReviewForm(false);
        // Reload reviews list
        fetchReviews();
      } else {
        alert(res.data.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Add to Wishlist
  const handleAddToWishlist = async () => {
    const userId = getUserId();
    if (!userId) {
      alert("Please login first to add items to your wishlist.");
      navigate('/login');
      return;
    }
    try {
      const payload = new FormData();
      payload.append('user_id', userId);
      payload.append('product_id', String(id)); 
      const config = { headers: authHeaders(ACTIVE_TOKEN) };
      const res = await axios.post(ADD_WISHLIST_URL, payload, config);
      if (String(res.data.flag) === "1") {
        alert(res.data.message || "Added to Wishlist!");
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  // Add to Cart
  const handleAddToCart = async () => {
    const userId = getUserId();
    if (!userId) {
      alert("Please login first to add items to your cart.");
      navigate('/login');
      return;
    }
    try {
      const payload = new FormData();
      payload.append('user_id', userId);       
      payload.append('product_id', String(id));      
      payload.append('product_qty', '1');            
      const config = { headers: authHeaders(ACTIVE_TOKEN) };
      const res = await axios.post(ADD_CART_URL, payload, config);
      if (String(res.data.flag) === "1") {
        alert("Product added to cart!");
      }
    } catch (err) {
      console.error("Cart error:", err);
    }
  };

  // Calculate Average Rating
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const totalStars = reviews.reduce((sum, item) => sum + parseFloat(item.rating_number || 0), 0);
    return (totalStars / reviews.length).toFixed(1);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading product details...</div>;
  if (!product) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Product not found.</div>;

  const averageRating = calculateAverageRating();

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "1100px", margin: "0 auto" }}>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ padding: "8px 15px", backgroundColor: "#f0f2f2", border: "1px solid #a8b3b3", cursor: "pointer", borderRadius: "8px", marginBottom: "20px" }}
      >
        ← Back to Products
      </button>
      
      {/* Product Details Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "40px" }}>
        
        {/* Left: Product Image */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "20px", border: "1px solid #ddd" }}>
          <img src={product.product_image} alt={product.product_name} style={{ maxWidth: "100%", maxHeight: "350px", objectFit: "contain" }} />
        </div>

        {/* Right: Product Info */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "13px", color: "#565959" }}>
            {product.category_name} &gt; {product.sub_category_name}
          </span>
          <h2 style={{ fontSize: "24px", margin: "10px 0", color: "#111" }}>{product.product_name}</h2>
          
          {/* Rating Summary */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
            <span style={{ backgroundColor: "#de7921", color: "white", padding: "3px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "14px" }}>
              ★ {averageRating > 0 ? averageRating : "New"}
            </span>
            <span style={{ fontSize: "14px", color: "#007185" }}>{reviews.length} customer ratings</span>
          </div>

          <h3 style={{ fontSize: "22px", color: "#b12704", margin: "0 0 15px 0" }}>₹{parseFloat(product.product_price).toLocaleString('en-IN')}</h3>
          
          <div style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "15px 0", marginBottom: "20px" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#333", lineHeight: "1.5" }}>
              <strong>About this item:</strong> <br />
              {product.product_details || "No details available for this product."}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "15px" }}>
            <button 
              onClick={handleAddToCart} 
              style={{ flex: 1, padding: "12px", backgroundColor: "#ffd814", borderColor: "#fcd200", color: "#0f1111", border: "1px solid", cursor: "pointer", borderRadius: "20px", fontWeight: "500" }}
            >
              Add to Cart
            </button>
            <button 
              onClick={handleAddToWishlist} 
              style={{ padding: "12px 20px", backgroundColor: "#fff", borderColor: "#d5d9d9", color: "#0f1111", border: "1px solid", cursor: "pointer", borderRadius: "20px" }}
            >
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* --- Customer Reviews Section --- */}
      <div style={{ marginTop: "20px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 style={{ fontSize: "20px", margin: "0", color: "#111" }}>Customer Reviews</h3>
          </div>
          
          {!showReviewForm && (
            <button 
              onClick={() => setShowReviewForm(true)}
              style={{ padding: "8px 15px", backgroundColor: "#fff", border: "1px solid #d5d9d9", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}
            >
              Write a product review
            </button>
          )}
        </div>

        {/* Write Review Form */}
        {showReviewForm && (
          <div style={{ backgroundColor: "#f8f9fa", border: "1px solid #ddd", borderRadius: "8px", padding: "20px", marginBottom: "25px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>Create Review</h4>
            
            <form onSubmit={handleReviewSubmit}>
              
              {/* Star Rating Selection */}
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }}>
                  Overall rating:
                </label>
                <div style={{ display: "flex", gap: "5px" }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isSelected = star <= (hoveredStar || ratingNumber);
                    return (
                      <span
                        key={star}
                        onClick={() => setRatingNumber(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        style={{ fontSize: "26px", cursor: "pointer", color: isSelected ? "#b12704" : "#ccc" }}
                      >
                        ★
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Name Input */}
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }}>
                  Your name:
                </label>
                <input 
                  type="text" 
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="Enter your name"
                  style={{ width: "100%", boxSizing: "border-box", padding: "8px", borderRadius: "4px", border: "1px solid #888", fontSize: "14px" }}
                  required
                />
              </div>
              
              {/* Message Input */}
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }}>
                  Add a written review:
                </label>
                <textarea 
                  rows="4"
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  placeholder="What did you like or dislike?"
                  style={{ width: "100%", boxSizing: "border-box", padding: "8px", borderRadius: "4px", border: "1px solid #888", fontSize: "14px", fontFamily: "inherit" }}
                  required
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button 
                  type="button" 
                  onClick={() => setShowReviewForm(false)}
                  style={{ padding: "8px 15px", backgroundColor: "#fff", border: "1px solid #d5d9d9", borderRadius: "4px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingReview}
                  style={{ padding: "8px 15px", backgroundColor: "#ffd814", border: "1px solid #a88734", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                >
                  {submittingReview ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List Grid */}
        {loadingReviews ? (
          <p style={{ color: "#565959", fontSize: "14px" }}>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div style={{ padding: "20px", border: "1px dashed #ccc", borderRadius: "8px", textAlign: "center", backgroundColor: "#fdfdfd" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#565959" }}>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {reviews.map((rev, index) => {
              const starsCount = parseInt(rev.rating_number || 5, 10);
              
              return (
                <div 
                  key={index} 
                  style={{ borderBottom: "1px solid #eee", paddingBottom: "15px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                    <strong style={{ fontSize: "14px", color: "#111" }}>{rev.rating_name || "Verified Buyer"}</strong>
                  </div>
                  
                  {/* Review Stars */}
                  <div style={{ color: "#b12704", fontSize: "14px", marginBottom: "5px" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < starsCount ? "★" : "☆"}</span>
                    ))}
                  </div>

                  {/* Review Message */}
                  <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#333", lineHeight: "1.4" }}>
                    {rev.rating_message}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;