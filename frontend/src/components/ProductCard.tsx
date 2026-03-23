import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const imageUrl = product.images?.[0]?.url || product.images?.[0]?.imageUrl || '/placeholder.svg';

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block rounded-lg border bg-card p-3 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="mb-3 aspect-square overflow-hidden rounded-md bg-muted">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-contain transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
       <h3 className="mb-1 line-clamp-2 text-sm font-medium text-card-foreground">{product.name}</h3>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-base font-bold text-foreground">
          ₹{(product.discountPrice || product.price).toLocaleString()}
        </span>
        {discount > 0 && (
          <>
            <span className="text-xs line-through text-muted-foreground">₹{product.price.toLocaleString()}</span>
            <span className="text-xs font-semibold text-accent">{discount}% off</span>
          </>
        )}
      </div>
      {(product.ratingAverage ?? 0) > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-warning text-warning" />
          <span>{product.ratingAverage?.toFixed(1)}</span>
          <span>({product.ratingCount})</span>
        </div>
      )}
      {product.stock === 0 && (
        <span className="mt-1 inline-block text-xs font-medium text-destructive">Out of stock</span>
      )}
    </Link>
  );
}
