import { useEffect, useState } from 'react';
import { adminApi, categoryApi } from '@/lib/api';
import { PageLoader, ButtonSpinner } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Store, Package, Tag, CheckCircle, XCircle, Ban, Unlock } from 'lucide-react';

const AdminDashboard = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState('users'); 
  const [users, setUsers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Category form
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, s, ps, pp, c] = await Promise.all([
        adminApi.getAllUsers().catch(() => ({ users: [] })),
        adminApi.getAllSellers().catch(() => ({ sellers: [] })),
        adminApi.getPendingSellers().catch(() => ({ sellers: [] })),
        adminApi.getPendingProducts().catch(() => ({ products: [] })),
        categoryApi.getAll().catch(() => ({ categories: [] })),
      ]);
      setUsers(u.users || []);
      setSellers(s.sellers || []);
      setPendingSellers(ps.sellers || []);
      setPendingProducts(pp.products || []);
      setCategories(c.categories || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const action = async (fn: () => Promise<any>, id: string) => {
    setActionLoading(id);
    try { await fn(); toast({ title: 'Success' }); fetchAll(); }
    catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    finally { setActionLoading(null); }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCat(true);
    try {
      await categoryApi.create({ name: catName, description: catDesc });
      toast({ title: 'Category created!' });
      setCatName(''); setCatDesc('');
      fetchAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setCreatingCat(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Users', value: users.length, icon: Users },
          { label: 'Sellers', value: sellers.length, icon: Store },
          { label: 'Pending Sellers', value: pendingSellers.length, icon: Store },
          { label: 'Pending Products', value: pendingProducts.length, icon: Package },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <Icon className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-card-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="users"><Users className="mr-1 h-4 w-4" />Users</TabsTrigger>
          <TabsTrigger value="sellers"><Store className="mr-1 h-4 w-4" />Sellers</TabsTrigger>
          <TabsTrigger value="products"><Package className="mr-1 h-4 w-4" />Products</TabsTrigger>
          <TabsTrigger value="categories"><Tag className="mr-1 h-4 w-4" />Categories</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="rounded-lg border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Role</th><th className="p-3 text-left">Status</th><th className="p-3">Actions</th></tr></thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u._id} className="border-b">
                    <td className="p-3 text-card-foreground">{u.name || '-'}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3 capitalize">{u.role}</td>
                    <td className="p-3">{u.isBlocked ? <span className="text-destructive text-xs font-medium">Blocked</span> : <span className="text-success text-xs font-medium">Active</span>}</td>
                    <td className="p-3 text-center">
                      {u.isBlocked ? (
                        <Button size="sm" variant="outline" disabled={actionLoading === u._id} onClick={() => action(() => adminApi.unblockUser(u._id), u._id)}>
                          <Unlock className="mr-1 h-3 w-3" />Unblock
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-destructive" disabled={actionLoading === u._id} onClick={() => action(() => adminApi.blockUser(u._id), u._id)}>
                          <Ban className="mr-1 h-3 w-3" />Block
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Sellers Tab */}
        <TabsContent value="sellers">
          {pendingSellers.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">Pending Approvals</h3>
              <div className="space-y-3">
                {pendingSellers.map((s: any) => (
                  <div key={s._id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                    <div>
                      <p className="font-medium text-card-foreground">{s.shopName}</p>
                      <p className="text-xs text-muted-foreground">{s.userId?.email || s.userId}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => action(() => adminApi.verifySeller(s._id), s._id)} disabled={actionLoading === s._id}>
                        <CheckCircle className="mr-1 h-3 w-3" />Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => action(() => adminApi.rejectSeller(s._id), s._id)} disabled={actionLoading === s._id}>
                        <XCircle className="mr-1 h-3 w-3" />Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <h3 className="font-semibold text-foreground mb-3">All Sellers</h3>
          <div className="rounded-lg border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left">Shop</th><th className="p-3 text-left">Status</th><th className="p-3">Actions</th></tr></thead>
              <tbody>
                {sellers.map((s: any) => (
                  <tr key={s._id} className="border-b">
                    <td className="p-3 text-card-foreground">{s.shopName}</td>
                    <td className="p-3 capitalize text-xs">{s.approvalStatus}</td>
                    <td className="p-3 text-center">
                      {s.isBlocked ? (
                        <Button size="sm" variant="outline" onClick={() => action(() => adminApi.unblockSeller(s._id), s._id)}>Unblock</Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => action(() => adminApi.blockSeller(s._id), s._id)}>Block</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <h3 className="font-semibold text-foreground mb-3">Pending Product Approvals</h3>
          {pendingProducts.length === 0 ? (
            <p className="text-muted-foreground">No pending products</p>
          ) : (
            <div className="space-y-3">
              {pendingProducts.map((p: any) => (
                <div key={p._id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]?.url || p.images?.[0]?.imageUrl || '/placeholder.svg'} alt="" className="w-12 h-12 rounded object-contain bg-muted" />
                    <div>
                      <p className="font-medium text-card-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">₹{p.price} • Stock: {p.stock}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => action(() => adminApi.verifyProduct(p._id), p._id)} disabled={actionLoading === p._id}>
                      <CheckCircle className="mr-1 h-3 w-3" />Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => action(() => adminApi.rejectProduct(p._id), p._id)} disabled={actionLoading === p._id}>
                      <XCircle className="mr-1 h-3 w-3" />Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="rounded-lg border bg-card p-5 mb-6">
            <h3 className="font-semibold text-card-foreground mb-3">Create Category</h3>
            <form onSubmit={handleCreateCategory} className="flex flex-wrap gap-3 items-end">
              <div>
                <Label>Name</Label>
                <Input value={catName} onChange={e => setCatName(e.target.value)} required className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={catDesc} onChange={e => setCatDesc(e.target.value)} className="mt-1" />
              </div>
              <Button type="submit" disabled={creatingCat}>{creatingCat && <ButtonSpinner />}Create</Button>
            </form>
          </div>
          <div className="rounded-lg border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Slug</th><th className="p-3 text-left">Status</th><th className="p-3">Actions</th></tr></thead>
              <tbody>
                {categories.map((c: any) => (
                  <tr key={c._id} className="border-b">
                    <td className="p-3 text-card-foreground">{c.name}</td>
                    <td className="p-3 text-muted-foreground">{c.slug}</td>
                    <td className="p-3">{c.isActive ? <span className="text-success text-xs">Active</span> : <span className="text-destructive text-xs">Inactive</span>}</td>
                    <td className="p-3 text-center">
                      <Button size="sm" variant="destructive" onClick={() => action(() => categoryApi.delete(c._id), c._id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
