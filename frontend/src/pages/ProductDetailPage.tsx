import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productApi, cartApi, wishlistApi, reviewApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader, ButtonSpinner } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Star, ShoppingCart, Heart, Minus, Plus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, activeRole } = useAuth()
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      productApi.getById(id),
      reviewApi.getByProduct(id).catch(() => ({ reviews: [] })),
    ]).then(([pData, rData]) => {
      setProduct(pData.product || pData.data || pData);
      setReviews(rData.reviews || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!id) return;
    setAdding(true);
    try {
      await cartApi.add(id, qty);
      toast({ title: 'Added to Cart!', description: `${product.name} x${qty}` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!id) return;
    try {
      await wishlistApi.add(id);
      toast({ title: 'Added to Wishlist!' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingReview(true);
    try {
      await reviewApi.add({ productId: id, rating: reviewRating, comment: reviewText });
      toast({ title: 'Review submitted!' });
      setReviewText('');
      const rData = await reviewApi.getByProduct(id);
      setReviews(rData.reviews || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return <div className="page-container text-center py-20 text-muted-foreground">Product not found</div>;

  const images = product.images || [];
  const discount = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  return (
    <div className="page-container animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-lg border bg-muted overflow-hidden mb-3">
            <img
              src={images[selectedImg]?.url || images[selectedImg]?.imageUrl || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded border overflow-hidden flex-shrink-0 ${i === selectedImg ? 'ring-2 ring-primary' : ''}`}
                >
                  <img src={img.url || img.imageUrl} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">{product.name}</h1>
          {(product.ratingAverage ?? 0) > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 rounded bg-accent px-2 py-0.5 text-sm font-semibold text-accent-foreground">
                {product.ratingAverage?.toFixed(1)} <Star className="h-3 w-3 fill-current" />
              </span>
              <span className="text-sm text-muted-foreground">({product.ratingCount} reviews)</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-foreground">₹{(product.discountPrice || product.price).toLocaleString()}</span>
            {discount > 0 && (
              <>
                <span className="text-lg line-through text-muted-foreground">₹{product.price.toLocaleString()}</span>
                <span className="text-sm font-semibold text-accent">{discount}% off</span>
              </>
            )}
          </div>

          <p className="text-muted-foreground mb-6">{product.description}</p>

          <div className="mb-4 text-sm">
            <span className={product.stock > 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {activeRole === 'buyer' && product.stock > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2"><Minus className="h-4 w-4" /></button>
                <span className="px-4 py-2 font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2"><Plus className="h-4 w-4" /></button>
              </div>
              <Button onClick={handleAddToCart} disabled={adding} size="lg">
                {adding ? <ButtonSpinner /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                Add to Cart
              </Button>
              <Button variant="outline" size="lg" onClick={handleAddToWishlist}>
                <Heart className="mr-2 h-4 w-4" /> Wishlist
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="border-t pt-8">
        <h2 className="font-display text-xl font-bold text-foreground mb-6">Customer Reviews</h2>

        {activeRole === 'buyer' && (
          <form onSubmit={handleReviewSubmit} className="rounded-lg border bg-card p-5 mb-6">
            <h3 className="font-medium mb-3 text-card-foreground">Write a Review</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">Rating:</span>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setReviewRating(s)}>
                  <Star className={`h-5 w-5 ${s <= reviewRating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`} />
                </button>
              ))}
            </div>
            <Textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." className="mb-3" required />
            <Button type="submit" disabled={submittingReview} size="sm">
              {submittingReview && <ButtonSpinner />} Submit Review
            </Button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r: any) => (
              <div key={r._id} className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`h-4 w-4 ${s <= r.rating ? 'fill-warning text-warning' : 'text-muted-foreground/20'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{r.userId?.name || 'User'}</span>
                </div>
                <p className="text-sm text-card-foreground">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetailPage;
