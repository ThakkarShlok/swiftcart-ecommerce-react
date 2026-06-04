import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const ProductCard = ({ product, onAddToCart, showAddToCart = true, variant = 'default' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(price || 0));

  const rawStock = product.product_stock ?? product.stock ?? product.product_qty ?? product.quantity;
  const inStock = rawStock === undefined || rawStock === null || rawStock === '' ? true : Number(rawStock) > 0;
  const description = product.product_details || product.product_description || product.description || 'Quality product with dependable delivery and support.';

  return (
    <article className="group card-surface flex h-full flex-col overflow-hidden border-transparent transition duration-300 hover:-translate-y-1 hover:border-copper-100 hover:shadow-soft">
      <Link to={`/product/${product.product_id}`} className="relative block bg-surface-100">
        {!imageLoaded && !imageError && <div className="aspect-[4/3] animate-pulse bg-surface-200" />}
        {!imageError ? (
          <img
            src={product.product_image}
            alt={product.product_name}
            className={`aspect-[4/3] w-full object-contain p-4 transition duration-500 group-hover:scale-[1.03] ${imageLoaded ? 'relative opacity-100' : 'absolute inset-0 opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="grid aspect-[4/3] place-items-center rounded-[1.25rem] text-sm font-medium text-ink-500">Image unavailable</div>
        )}
        <div className="absolute left-4 top-4 rounded-full bg-surface-500/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-700 shadow-sm">
          {product.category_name || 'Catalog'}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-2.5 py-1 font-semibold ${inStock ? 'bg-copper-50 text-copper-700' : 'bg-surface-100 text-ink-500 border border-ink-100'}`}>
            {inStock ? 'In stock' : 'Out of stock'}
          </span>
          <span className="rounded-full border border-ink-100 bg-surface-100 px-2.5 py-1 text-xs font-semibold text-ink-600">
            {product.product_rating || '4.5'} ★
          </span>
        </div>

        <Link to={`/product/${product.product_id}`} className="mt-4">
          <h3 className="line-clamp-2 min-h-[3.25rem] text-base font-bold leading-6 text-ink-950 transition group-hover:text-copper-600">
            {product.product_name}
          </h3>
        </Link>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-500">{description}</p>

        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <div className="text-xl font-black text-ink-950">{formatPrice(product.product_price)}</div>
              {product.original_price && (
                <div className="text-sm text-ink-400 line-through">{formatPrice(product.original_price)}</div>
              )}
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">Inclusive of taxes</span>
          </div>

          {showAddToCart && (
            <Button
              variant={variant === 'compact' ? 'secondary' : 'primary'}
              size="sm"
              fullWidth
              onClick={() => onAddToCart?.(product)}
              disabled={!inStock}
            >
              {inStock ? 'Add to cart' : 'Notify me'}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
