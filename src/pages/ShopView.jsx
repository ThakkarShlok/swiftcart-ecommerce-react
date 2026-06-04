import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';
import { getApiUrl, authHeaders, API_TOKEN } from '../api/apiConfig';

const ShopView = ({ globalSearchQuery, token, onAddToCart }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(100000);
  const [sortOrder, setSortOrder] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const ACTIVE_TOKEN = token || API_TOKEN;

  useEffect(() => {
    const fetchShopItems = async () => {
      setLoading(true);
      try {
        const formData = new FormData();
        const productRes = await axios.post(getApiUrl('api-list-product.php'), formData, {
          headers: authHeaders(ACTIVE_TOKEN),
        });

        if (productRes.data?.flag === '1') {
          setItems(productRes.data.product_list || []);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Shop items network load error:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShopItems();
  }, [ACTIVE_TOKEN]);

  const categories = useMemo(() => {
    const list = items?.map((item) => item.category_name || 'Other') || [];
    return ['All', ...Array.from(new Set(list))];
  }, [items]);

  const filteredItems = useMemo(() => {
    const search = (globalSearchQuery || '').toLowerCase();

    return (items || [])
      .filter((item) => {
        const price = Number(item.product_price || 0);
        const matchesPrice = price >= priceMin && price <= priceMax;
        const matchesCategory = selectedCategory === 'All' || (item.category_name || 'Other') === selectedCategory;
        const matchesSearch =
          !search ||
          item.product_name?.toLowerCase().includes(search) ||
          item.product_details?.toLowerCase().includes(search) ||
          item.category_name?.toLowerCase().includes(search);

        return matchesPrice && matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortOrder === 'lowToHigh') return Number(a.product_price || 0) - Number(b.product_price || 0);
        if (sortOrder === 'highToLow') return Number(b.product_price || 0) - Number(a.product_price || 0);
        return 0;
      });
  }, [items, globalSearchQuery, priceMin, priceMax, sortOrder, selectedCategory]);

  return (
    <div className="container-custom py-10">
      <div className="mb-8 rounded-[1.75rem] border border-copper-100 bg-gradient-to-br from-copper-50 via-white to-surface-100 p-8 shadow-soft">
        <p className="eyebrow text-copper-600">Shop smarter</p>
        <h1 className="section-heading mt-2">Find your next buy</h1>
        <p className="section-copy mt-3">Use search, budget, category, and sorting together for a more focused shopping flow.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <aside className="h-fit rounded-[1.75rem] border border-ink-100 bg-surface-500 p-6 shadow-soft xl:sticky xl:top-28">
          <div className="mb-6">
            <p className="text-sm font-bold text-ink-950">Filter shop</p>
            <p className="mt-1 text-sm text-ink-500">Narrow by need and budget.</p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-bold text-ink-700">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${selectedCategory === category ? 'border-copper-500 bg-copper-50 text-copper-700' : 'border-ink-100 bg-surface-500 text-ink-600 hover:bg-surface-100'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-bold text-ink-700">Price range</p>
              <div className="grid gap-3">
                <input
                  type="number"
                  min={0}
                  value={priceMin}
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  placeholder="Min price"
                  className="field"
                />
                <input
                  type="number"
                  min={0}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  placeholder="Max price"
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-ink-700">Sort by</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="field"
              >
                <option value="">Featured</option>
                <option value="lowToHigh">Price: low to high</option>
                <option value="highToLow">Price: high to low</option>
              </select>
            </div>

            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setSelectedCategory('All');
                setPriceMin(0);
                setPriceMax(100000);
                setSortOrder('');
              }}
            >
              Reset filters
            </Button>
          </div>
        </aside>

        <main>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-ink-500">{filteredItems.length} items available</p>
              <h2 className="text-2xl font-bold text-ink-950">Shop results</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-ink-500">
              <span className="rounded-2xl bg-surface-500 px-3 py-2">Search: {globalSearchQuery || 'All'}</span>
              <span className="rounded-2xl bg-surface-500 px-3 py-2">Sort: {sortOrder || 'Featured'}</span>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="h-[390px] animate-pulse rounded-[1.5rem] bg-surface-200" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="card-surface p-12 text-center text-ink-500">
              No items match your filters.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item) => (
                <ProductCard key={item.product_id} product={item} onAddToCart={onAddToCart} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ShopView;
