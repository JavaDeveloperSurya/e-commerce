import { useEffect, useState } from 'react';
import { sellerApi, productApi, orderApi, paymentApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader, ButtonSpinner } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, Edit, Trash2, CreditCard, Store, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', discountPrice: '', categoryId: '', stock: '' });
  const [productImages, setProductImages] = useState<FileList | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);

  // Seller registration form
  const [regForm, setRegForm] = useState({ shopName: '', shopDescription: '', businessAddress: '', accountNumber: '', ifscCode: '', bankName: '' });
  const [registering, setRegistering] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prods, payments, profile] = await Promise.all([
        sellerApi.getMyProducts().catch(() => ({ products: [] })),
        paymentApi.getPending().catch(() => ({ payments: [] })),
        sellerApi.getProfile().catch(() => null),
      ]);
      setProducts(prods.products || prods.data || []);
      setPendingPayments(payments.payments || payments.data || []);
      setSellerProfile(profile?.seller || profile?.data || profile);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {
      await sellerApi.register({
        shopName: regForm.shopName,
        shopDescription: regForm.shopDescription,
        businessAddress: regForm.businessAddress,
        bankDetails: { accountNumber: regForm.accountNumber, ifscCode: regForm.ifscCode, bankName: regForm.bankName },
      });
      toast({ title: 'Seller Registration Submitted!', description: 'Awaiting admin approval.' });
      await refreshProfile();
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setRegistering(false); }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProduct(true);
    try {
      const fd = new FormData();
      fd.append('name', productForm.name);
      fd.append('description', productForm.description);
      fd.append('price', productForm.price);
      if (productForm.discountPrice) fd.append('discountPrice', productForm.discountPrice);
      fd.append('categoryId', productForm.categoryId);
      fd.append('stock', productForm.stock);
      if (productImages) {
        Array.from(productImages).forEach(f => fd.append('images', f));
      }
      await productApi.create(fd);
      toast({ title: 'Product created!', description: 'Awaiting admin approval.' });
      setShowProductForm(false);
      setProductForm({ name: '', description: '', price: '', discountPrice: '', categoryId: '', stock: '' });
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setCreatingProduct(false); }
  };

  const handleDeleteProduct = async (id: string) => {
    setActionLoading(id);
    try {
      await productApi.delete(id);
      toast({ title: 'Product deleted' });
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setActionLoading(null); }
  };

  const handlePaymentAction = async (orderId: string, type: 'approve' | 'reject') => {
    setActionLoading(orderId);
    try {
      if (type === 'approve') await paymentApi.approve(orderId);
      else await paymentApi.reject(orderId);
      toast({ title: `Payment ${type}d` });
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setActionLoading(null); }
  };

  if (loading) return <PageLoader />;

  // If not a seller yet, show registration form
  if (user?.role !== 'seller' && !sellerProfile) {
    return (
      <div className="page-container animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Become a Seller</h1>
        <div className="max-w-lg rounded-lg border bg-card p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div><Label>Shop Name</Label><Input value={regForm.shopName} onChange={e => setRegForm(p => ({ ...p, shopName: e.target.value }))} required className="mt-1" /></div>
            <div><Label>Shop Description</Label><Textarea value={regForm.shopDescription} onChange={e => setRegForm(p => ({ ...p, shopDescription: e.target.value }))} className="mt-1" /></div>
            <div><Label>Business Address</Label><Input value={regForm.businessAddress} onChange={e => setRegForm(p => ({ ...p, businessAddress: e.target.value }))} className="mt-1" /></div>
            <h3 className="text-sm font-medium text-muted-foreground">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label>Account Number</Label><Input value={regForm.accountNumber} onChange={e => setRegForm(p => ({ ...p, accountNumber: e.target.value }))} className="mt-1" /></div>
              <div><Label>IFSC Code</Label><Input value={regForm.ifscCode} onChange={e => setRegForm(p => ({ ...p, ifscCode: e.target.value }))} className="mt-1" /></div>
              <div><Label>Bank Name</Label><Input value={regForm.bankName} onChange={e => setRegForm(p => ({ ...p, bankName: e.target.value }))} className="mt-1" /></div>
            </div>
            <Button type="submit" disabled={registering}>{registering && <ButtonSpinner />}<Store className="mr-2 h-4 w-4" />Register as Seller</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Seller Dashboard</h1>
        {sellerProfile?.approvalStatus === 'pending' && (
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-warning/10 text-warning">Pending Approval</span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border bg-card p-4"><Package className="h-5 w-5 text-primary mb-2" /><p className="text-2xl font-bold text-card-foreground">{products.length}</p><p className="text-xs text-muted-foreground">Products</p></div>
        <div className="rounded-lg border bg-card p-4"><CreditCard className="h-5 w-5 text-secondary mb-2" /><p className="text-2xl font-bold text-card-foreground">{pendingPayments.length}</p><p className="text-xs text-muted-foreground">Pending Payments</p></div>
        <div className="rounded-lg border bg-card p-4"><Store className="h-5 w-5 text-accent mb-2" /><p className="text-2xl font-bold text-card-foreground capitalize">{sellerProfile?.approvalStatus || 'N/A'}</p><p className="text-xs text-muted-foreground">Status</p></div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="products"><Package className="mr-1 h-4 w-4" />Products</TabsTrigger>
          <TabsTrigger value="payments"><CreditCard className="mr-1 h-4 w-4" />Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">My Products</h3>
            <Button size="sm" onClick={() => setShowProductForm(!showProductForm)}>
              <Plus className="mr-1 h-4 w-4" />{showProductForm ? 'Cancel' : 'Add Product'}
            </Button>
          </div>

          {showProductForm && (
            <form onSubmit={handleCreateProduct} className="rounded-lg border bg-card p-5 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Product Name</Label><Input value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} required className="mt-1" /></div>
                <div><Label>Category ID</Label><Input value={productForm.categoryId} onChange={e => setProductForm(p => ({ ...p, categoryId: e.target.value }))} required className="mt-1" placeholder="MongoDB ObjectId" /></div>
                <div><Label>Price (₹)</Label><Input type="number" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} required className="mt-1" /></div>
                <div><Label>Discount Price (₹)</Label><Input type="number" value={productForm.discountPrice} onChange={e => setProductForm(p => ({ ...p, discountPrice: e.target.value }))} className="mt-1" /></div>
                <div><Label>Stock</Label><Input type="number" value={productForm.stock} onChange={e => setProductForm(p => ({ ...p, stock: e.target.value }))} required className="mt-1" /></div>
                <div><Label>Images (max 5)</Label><input type="file" accept="image/*" multiple onChange={e => setProductImages(e.target.files)} className="mt-1 text-sm" /></div>
              </div>
              <div><Label>Description</Label><Textarea value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} className="mt-1" /></div>
              <Button type="submit" disabled={creatingProduct}>{creatingProduct && <ButtonSpinner />}Create Product</Button>
            </form>
          )}

          {products.length === 0 ? (
            <p className="text-muted-foreground">No products yet</p>
          ) : (
            <div className="rounded-lg border bg-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left">Product</th><th className="p-3 text-left">Price</th><th className="p-3 text-left">Stock</th><th className="p-3 text-left">Status</th><th className="p-3">Actions</th></tr></thead>
                <tbody>
                  {products.map((p: any) => (
                    <tr key={p._id} className="border-b">
                      <td className="p-3 text-card-foreground">{p.name}</td>
                      <td className="p-3">₹{p.price}</td>
                      <td className="p-3">{p.stock}</td>
                      <td className="p-3 capitalize text-xs">{p.status}</td>
                      <td className="p-3 text-center flex gap-2 justify-center">
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(p._id)} disabled={actionLoading === p._id}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments">
          {pendingPayments.length === 0 ? (
            <p className="text-muted-foreground">No pending payments</p>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((p: any) => (
                <div key={p._id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Order #{p.orderId?._id?.slice(-8) || p.orderId}</p>
                    <p className="text-xs text-muted-foreground">₹{p.amount} • {p.paymentMethod}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handlePaymentAction(p.orderId?._id || p.orderId, 'approve')} disabled={actionLoading === (p.orderId?._id || p.orderId)}>
                      <CheckCircle className="mr-1 h-3 w-3" />Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handlePaymentAction(p.orderId?._id || p.orderId, 'reject')} disabled={actionLoading === (p.orderId?._id || p.orderId)}>
                      <XCircle className="mr-1 h-3 w-3" />Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerDashboard;
