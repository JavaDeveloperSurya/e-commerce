import { useEffect, useState } from 'react';
import { adminApi, categoryApi } from '@/lib/api';
import { PageLoader, ButtonSpinner } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Store, Package, Tag, CheckCircle, XCircle, Ban, Unlock } from 'lucide-react';
import type { Category } from '@/lib/types';

const AdminDashboard = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState('users'); 
  const [users, setUsers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Category form
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
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
    try {
      await fn();
      toast({ title: 'Success' });
      fetchAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
  e.preventDefault();
  setCreatingCat(true);
  try {
    await categoryApi.create({
      name: catName,
      description: catDesc,
      parentCategory: parentCategoryId || null,
    });
    toast({ title: 'Category created!' });
    setCatName('');
    setCatDesc('');
    setParentCategoryId('');
    fetchAll();
  } catch (err: any) {
    toast({ title: 'Error', description: err.message, variant: 'destructive' });
  } finally {
    setCreatingCat(false);
  }
};

const topLevelCategories = categories.filter(category => !category.parentCategory);

  if (loading) return <PageLoader />;

  return (
    <div className="page-container animate-fade-in">
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Users', value: users.length, icon: Users },
          { label: 'Sellers', value: sellers.length, icon: Store },
          { label: 'Pending Sellers', value: pendingSellers.length, icon: Store },
          { label: 'Pending Products', value: pendingProducts.length, icon: Package },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <Icon className="mb-2 h-5 w-5 text-primary" />
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
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Role</th><th className="p-3 text-left">Status</th><th className="p-3">Actions</th></tr></thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u._id} className="border-b">
                    <td className="p-3 text-card-foreground">{u.name || '-'}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3 capitalize">{u.role}</td>
                    <td className="p-3">{u.isBlocked ? <span className="text-xs font-medium text-destructive">Blocked</span> : <span className="text-xs font-medium text-success">Active</span>}</td>
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
              <h3 className="mb-3 font-semibold text-foreground">Pending Approvals</h3>
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
          <h3 className="mb-3 font-semibold text-foreground">All Sellers</h3>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left">Shop</th><th className="p-3 text-left">Status</th><th className="p-3">Actions</th></tr></thead>
              <tbody>
                {sellers.map((s: any) => (
                  <tr key={s._id} className="border-b">
                    <td className="p-3 text-card-foreground">{s.shopName}</td>
                    <td className="p-3 text-xs capitalize">{s.approvalStatus}</td>
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
          <h3 className="mb-3 font-semibold text-foreground">Pending Product Approvals</h3>
          {pendingProducts.length === 0 ? (
            <p className="text-muted-foreground">No pending products</p>
          ) : (
            <div className="space-y-3">
              {pendingProducts.map((p: any) => (
                <div key={p._id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]?.url || p.images?.[0]?.imageUrl || '/placeholder.svg'} alt="" className="h-12 w-12 rounded bg-muted object-contain" />
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
            <div className="mb-6 rounded-lg border bg-card p-5">
            <h3 className="mb-3 font-semibold text-card-foreground">Create Category</h3>
            <form onSubmit={handleCreateCategory} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div>
        <Label>Name</Label>
        <Input value={catName} onChange={e => setCatName(e.target.value)} required className="mt-1" />
      </div>
      <div>
        <Label>Parent Category</Label>
        <select
          value={parentCategoryId}
          onChange={e => setParentCategoryId(e.target.value)}
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">No parent category</option>
          {topLevelCategories.map(category => (
            <option key={category._id} value={category._id}>{category.name}</option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2 xl:col-span-1">
        <Label>Description</Label>
        <Input value={catDesc} onChange={e => setCatDesc(e.target.value)} className="mt-1" />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={creatingCat} className="w-full xl:w-auto">{creatingCat && <ButtonSpinner />}Create</Button>
      </div>
    </form>
  </div>
  <div className="overflow-x-auto rounded-lg border bg-card">
    <table className="w-full text-sm">
      <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Slug</th><th className="p-3 text-left">Parent Category</th><th className="p-3 text-left">Description</th><th className="p-3 text-left">Status</th><th className="p-3">Actions</th></tr></thead>
      <tbody>
        {categories.map(category => (
          <tr key={category._id} className="border-b">
            <td className="p-3 text-card-foreground">{category.name}</td>
            <td className="p-3 text-muted-foreground">{category.slug}</td>
            <td className="p-3 text-muted-foreground">{category.parentCategory?.name || '—'}</td>
            <td className="max-w-xs p-3 text-muted-foreground">{category.description || '—'}</td>
            <td className="p-3">{category.isActive ? <span className="text-xs text-success">Active</span> : <span className="text-xs text-destructive">Inactive</span>}</td>
            <td className="p-3 text-center">
              <Button size="sm" variant="destructive" onClick={() => action(() => categoryApi.delete(category._id), category._id)}>Delete</Button>
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
