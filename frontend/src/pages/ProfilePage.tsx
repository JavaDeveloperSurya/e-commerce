import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ButtonSpinner, PageLoader } from '@/components/Spinner';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, isLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || '',
    country: user?.addresses?.[0]?.country || 'India',
    postalCode: user?.addresses?.[0]?.postalCode || '',
  });

  if (isLoading) return <PageLoader />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.updateProfile({
        name: form.name,
        phone: form.phone,
        addresses: [{
          label: 'Home',
          street: form.street,
          city: form.city,
          state: form.state,
          country: form.country,
          postalCode: form.postalCode,
        }],
      });
      await refreshProfile();
      toast({ title: 'Profile Updated!' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">My Profile</h1>

      <div className="max-w-2xl">
        <div className="rounded-lg border bg-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-card-foreground">{user?.name || 'User'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{user?.role}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="mt-1" />
              </div>
            </div>
            <h3 className="font-medium text-sm text-muted-foreground pt-2">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Street</Label>
                <Input value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>State</Label>
                <Input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Country</Label>
                <Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input value={form.postalCode} onChange={e => setForm(p => ({ ...p, postalCode: e.target.value }))} className="mt-1" />
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <ButtonSpinner /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
