import { useEffect, useState } from 'react';
import { wishlistApi } from '@/lib/api';
import { PageLoader } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';

const WishlistPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWishlist = async () => {
    try {
      const data = await wishlistApi.get();
      setItems(data.wishlist?.items || data.data?.items || data.data?.products || data.items || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const removeItem = async (productId: string) => {
    try {
      await wishlistApi.remove(productId);
      toast({ title: 'Removed from wishlist' });
      fetchWishlist();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
          <p className="text-lg text-muted-foreground mb-4">Your wishlist is empty</p>
          <Button asChild><Link to="/products">Browse Products</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item: any) => {
            const product = item.productId || item;
            return (
              <div key={product._id} className="rounded-lg border bg-card p-3 relative group">
                <button onClick={() => removeItem(product._id)} className="absolute top-2 right-2 z-10 bg-card rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
                <Link to={`/product/${product._id}`}>
                  <div className="aspect-square rounded bg-muted overflow-hidden mb-2">
                    <img src={product.images?.[0]?.url || product.images?.[0]?.imageUrl || '/placeholder.svg'} alt="" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-sm font-medium line-clamp-2 text-card-foreground">{product.name}</h3>
                  <p className="text-sm font-bold text-foreground mt-1">₹{(product.discountPrice || product.price)?.toLocaleString()}</p>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
