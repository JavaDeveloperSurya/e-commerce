import { useEffect, useState } from 'react';
import { cartApi, orderApi, paymentApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader, ButtonSpinner } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({
    street: '', city: '', state: '', country: 'India', postalCode: '',
  });

  useEffect(() => {
    cartApi.get()
      .then(data => {
        setCart(data.cart || data.data || data);
        // Pre-fill address if user has one
        if (user?.addresses?.[0]) {
          const a = user.addresses[0];
          setAddress({ street: a.street || '', city: a.city || '', state: a.state || '', country: a.country || 'India', postalCode: a.postalCode || '' });
        }
      })
      .catch(err => toast({ title: 'Error', description: err.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [user]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const orderData = await orderApi.create({ shippingAddress: address });
      const orderId = orderData.order?._id || orderData.data?._id;

      if (orderId) {
        await paymentApi.create({ orderId, amount: total, paymentMethod: 'COD', transactionId: `COD_${Date.now()}` });
      }

      toast({ title: 'Order Placed!', description: 'Your order has been placed successfully.' });
      navigate('/orders');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <PageLoader />;

  const items = cart?.items || [];
  const total = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

  return (
    <div className="page-container animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-display font-semibold text-card-foreground mb-4">Shipping Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Street Address</Label>
                <Input value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} required className="mt-1" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} required className="mt-1" />
              </div>
              <div>
                <Label>State</Label>
                <Input value={address.state} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))} required className="mt-1" />
              </div>
              <div>
                <Label>Country</Label>
                <Input value={address.country} onChange={e => setAddress(p => ({ ...p, country: e.target.value }))} required className="mt-1" />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input value={address.postalCode} onChange={e => setAddress(p => ({ ...p, postalCode: e.target.value }))} required className="mt-1" />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-display font-semibold text-card-foreground mb-4">Payment Method</h3>
            <div className="rounded-lg border border-primary bg-primary/5 p-3 text-sm">
              <p className="font-medium text-card-foreground">Cash on Delivery</p>
              <p className="mt-1 text-muted-foreground">This checkout currently creates COD payments only.</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg border bg-card p-6 h-fit sticky top-24">
          <h3 className="font-display font-semibold text-card-foreground mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4">
            {items.map((item: any) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span className="text-muted-foreground line-clamp-1">{item.productId?.name || 'Product'} x{item.quantity}</span>
                <span className="text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-semibold text-foreground mb-4">
            <span>Total</span><span>₹{total.toLocaleString()}</span>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={placing || items.length === 0}>
            {placing && <ButtonSpinner />}
            Place Order
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
