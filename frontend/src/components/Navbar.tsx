import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Heart, User, LogOut, Package, LayoutDashboard, Store, Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card shadow-card">
      <div className="page-container flex items-center gap-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 font-display text-xl font-bold text-primary">
          Shop<span className="text-secondary">Ease</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products, brands..."
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </form>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin"><LayoutDashboard className="mr-1 h-4 w-4" />Admin</Link>
                </Button>
              )}
               {(user?.role === 'seller' || user?.role === 'buyer') && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/seller"><Store className="mr-1 h-4 w-4" />Seller</Link>
                </Button>
              )}
              {user?.role === 'buyer' && (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/wishlist"><Heart className="mr-1 h-4 w-4" />Wishlist</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/cart"><ShoppingCart className="mr-1 h-4 w-4" />Cart</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/orders"><Package className="mr-1 h-4 w-4" />Orders</Link>
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile"><User className="mr-1 h-4 w-4" />{user?.name || 'Profile'}</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1 h-4 w-4" />Logout
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden ml-auto" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-card px-4 py-3 space-y-2 animate-fade-in">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm"
              />
            </div>
          </form>
          <Link to="/products" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>All Products</Link>
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && <Link to="/admin" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Admin Dashboard</Link>}
              {(user?.role === 'seller' || user?.role === 'buyer') && <Link to="/seller" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Seller Dashboard</Link>}
              {user?.role === 'buyer' && (
                <>
                  <Link to="/cart" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Cart</Link>
                  <Link to="/wishlist" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Wishlist</Link>
                  <Link to="/orders" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Orders</Link>
                </>
              )}
              <Link to="/profile" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Profile</Link>
              <button className="block py-2 text-sm text-destructive" onClick={() => { handleLogout(); setMobileOpen(false); }}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="block py-2 text-sm font-medium text-primary" onClick={() => setMobileOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}
