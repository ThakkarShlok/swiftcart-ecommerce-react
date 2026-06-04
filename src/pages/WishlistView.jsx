import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, authHeaders } from '../api/apiConfig';
import Button from '../components/ui/Button';

const WishlistView = ({ token, isLoggedIn }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDatabaseWishlist = async () => {
    const cachedUserId = localStorage.getItem('stored_user_id');

    if (!isLoggedIn || !cachedUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('user_id', cachedUserId);
      const res = await axios.post(getApiUrl('api-list-wishlist.php'), payload, { headers: authHeaders(token) });
      setWishlistItems(res.data?.flag === '1' ? res.data.wishlist || [] : []);
    } catch (err) {
      console.error('Wishlist fetch failure:', err);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseWishlist();
  }, [isLoggedIn]);

  const handleRemoveItem = async (wishlistId) => {
    try {
      const payload = new FormData();
      payload.append('wishlist_id', wishlistId);
      const res = await axios.post(getApiUrl('api-delete-wishlist.php'), payload, { headers: authHeaders(token) });
      if (res.data.flag == '1' || res.data.flag == 1) fetchDatabaseWishlist();
      else alert(res.data.message || 'Could not remove item.');
    } catch (err) {
      console.error('Wishlist remove failure:', err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="card-surface mx-auto max-w-md p-8">
          <h1 className="text-2xl font-bold text-ink-950">Save products you like</h1>
          <p className="mt-2 text-ink-500">Sign in to manage your wishlist across sessions.</p>
          <Link to="/login" className="mt-6 inline-flex"><Button>Sign in</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <div className="mb-8">
        <p className="eyebrow">Saved products</p>
        <h1 className="section-heading mt-2">Wishlist</h1>
        <p className="section-copy mt-2">A clean saved-items view keeps product intent alive without clutter.</p>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => <div key={index} className="h-52 animate-pulse rounded-[1.5rem] bg-surface-200" />)}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <h2 className="text-xl font-bold text-ink-950">Your wishlist is empty</h2>
          <p className="mt-2 text-ink-500">Explore products and save the ones you want to compare later.</p>
          <Link to="/shop" className="mt-6 inline-flex"><Button>Explore shop</Button></Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((item) => (
            <article key={item.wishlist_id} className="card-surface overflow-hidden">
              <div className="bg-surface-200 p-4">
                <img src={item.product_image} alt={item.product_name} className="aspect-[4/3] w-full rounded-[1.5rem] bg-white object-contain p-3" />
              </div>
              <div className="p-5">
                <h2 className="line-clamp-2 min-h-[3rem] font-bold text-ink-950">{item.product_name}</h2>
                <p className="mt-2 text-xl font-black text-ink-950">Rs. {item.product_price}</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link to={`/product/${item.product_id}`} className="btn-primary justify-center">View</Link>
                  <Button variant="secondary" onClick={() => handleRemoveItem(item.wishlist_id)}>Remove</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistView;
