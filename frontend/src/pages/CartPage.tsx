import { useEffect, useState } from 'react';
import { cartApi } from '@/lib/api';
import { PageLoader, ButtonSpinner } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const CartPage = () => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const data = await cartApi.get();
      setCart(data.cart || data.data || data);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (productId: string, quantity: number) => {
    setUpdating(productId);
    try {
      await cartApi.update(productId, quantity);
      await fetchCart();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    setUpdating(productId);
    try {
      await cartApi.remove(productId);
      await fetchCart();
      toast({ title: 'Item removed' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clear();
      setCart(null);
      toast({ title: 'Cart cleared' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) return <PageLoader />;

  const items = cart?.items || [];
  const total = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

  return (
    <div className="page-container animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
          <p className="text-lg text-muted-foreground mb-4">Your cart is empty</p>
          <Button asChild><Link to="/products">Browse Products</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item: any) => {
              const product = item.productId || {};
              return (
                <div key={item._id || product._id} className="flex gap-4 rounded-lg border bg-card p-4">
                  <Link to={`/product/${product._id}`} className="w-20 h-20 rounded bg-muted flex-shrink-0 overflow-hidden">
                    <img src={product.images?.[0]?.url || product.images?.[0]?.imageUrl || '/placeholder.svg'} alt="" className="w-full h-full object-contain" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${product._id}`} className="font-medium text-card-foreground line-clamp-1 hover:text-primary">{product.name || 'Product'}</Link>
                    <p className="text-sm font-semibold text-foreground mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border rounded">
                        <button onClick={() => updateQty(product._id, item.quantity - 1)} disabled={item.quantity <= 1 || updating === product._id} className="px-2 py-1"><Minus className="h-3 w-3" /></button>
                        <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQty(product._id, item.quantity + 1)} disabled={updating === product._id} className="px-2 py-1"><Plus className="h-3 w-3" /></button>
                      </div>
                      <button onClick={() => removeItem(product._id)} disabled={updating === product._id} className="text-destructive hover:text-destructive/80 text-sm flex items-center gap-1">
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <button onClick={clearCart} className="text-sm text-destructive hover:underline">Clear Cart</button>
          </div>

          <div className="rounded-lg border bg-card p-6 h-fit sticky top-24">
            <h3 className="font-display font-semibold text-card-foreground mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Items ({items.length})</span><span>₹{total.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="text-accent font-medium">Free</span></div>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold text-foreground mb-4">
              <span>Total</span><span>₹{total.toLocaleString()}</span>
            </div>
            <Button className="w-full" size="lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
