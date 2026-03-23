import { useEffect, useState } from 'react';
import { orderApi } from '@/lib/api';
import { PageLoader } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Package, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
  created: 'bg-info/10 text-info',
  pending_payment: 'bg-warning/10 text-warning',
  paid: 'bg-success/10 text-success',
  shipped: 'bg-primary/10 text-primary',
  out_for_delivery: 'bg-accent/10 text-accent',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
  payment_failed: 'bg-destructive/10 text-destructive',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const data = await orderApi.getMyOrders();
      setOrders(data.orders || data.data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = async (id: string) => {
    try {
      await orderApi.cancel(id);
      toast({ title: 'Order cancelled' });
      fetchOrders();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
          <p className="text-lg text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order._id} className="rounded-lg border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Order #{order._id?.slice(-8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.orderStatus] || 'bg-muted text-muted-foreground'}`}>
                    {order.orderStatus?.replace(/_/g, ' ')}
                  </span>
                  {['created', 'pending_payment'].includes(order.orderStatus) && (
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleCancel(order._id)}>
                      <XCircle className="mr-1 h-4 w-4" /> Cancel
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-card-foreground">{item.productId?.name || 'Product'} x{item.quantity}</span>
                    <span className="text-foreground font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between font-semibold text-foreground">
                <span>Total</span>
                <span>₹{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
