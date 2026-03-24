import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { cartApi, categoryApi, orderApi, paymentApi, productApi, wishlistApi } from '@/lib/api';
import { ButtonSpinner, PageLoader } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Search, ShoppingCart, SlidersHorizontal, Tags, X, Zap } from 'lucide-react';
import type { Category, Product } from '@/lib/types';

const defaultAddress = { street: '', city: '', state: '', country: 'India', postalCode: '' };
const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, activeRole } = useAuth();
  const [buyingProduct, setBuyingProduct] = useState<Product | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [address, setAddress] = useState(defaultAddress);
  const searchQ = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const [localSearch, setLocalSearch] = useState(searchQ);

  useEffect(() => {
    setLocalSearch(searchQ);
  }, [searchQ]);
  useEffect(() => {
    if (user?.addresses?.[0]) {
      const first = user.addresses[0];
      setAddress({
        street: first.street || '',
        city: first.city || '',
        state: first.state || '',
        country: first.country || 'India',
        postalCode: first.postalCode || '',
      });
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const params = new URLSearchParams();
    if (searchQ) params.set('search', searchQ);
    if (selectedCategory) params.set('categoryId', selectedCategory);

    Promise.all([
      productApi.getAll(params.toString()),
      categoryApi.getAll()
    ])
      .then(([productData, categoryData]) => {
        if (!active) return;
        setProducts(productData.products || productData.data || []);
        setCategories(categoryData.categories || categoryData.data || []);
      })
      .catch((err: Error) => {
        if (!active) return;
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
   }, [searchQ, selectedCategory, toast]);

  const requireBuyer = () => {
    if (activeRole !== 'buyer') {
      toast({ title: 'Buyer account required', description: 'Switch to a buyer account to use cart, wishlist, or buy now.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localSearch) next.set('search', localSearch);
    else next.delete('search');
    setSearchParams(next);
  };
   const handleAddToCart = async (product: Product) => {
    if (!requireBuyer()) return;
    setActionLoading(`cart-${product._id}`);
    try {
      await cartApi.add(product._id, 1);
      toast({ title: 'Added to cart', description: product.name });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    if (!requireBuyer()) return;
    setActionLoading(`wishlist-${product._id}`);
    try {
      await wishlistApi.add(product._id);
      toast({ title: 'Added to wishlist', description: product.name });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const openBuyDialog = (product: Product) => {
    if (!requireBuyer()) return;
    setBuyingProduct(product);
    setBuyQuantity(1);
  };

  const handleBuyNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyingProduct) return;
    setPlacingOrder(true);
    try {
      const orderData = await orderApi.create({
        shippingAddress: address,
        directItem: {
          productId: buyingProduct._id,
          quantity: buyQuantity,
          price: buyingProduct.discountPrice || buyingProduct.price,
        },
      });
      const orderId = orderData.order?._id || orderData.data?._id;
      const amount = (buyingProduct.discountPrice || buyingProduct.price) * buyQuantity;

      if (orderId) {
        await paymentApi.create({
          orderId,
          amount,
          paymentMethod: 'COD',
          transactionId: `COD_${Date.now()}`,
        });
      }

      toast({ title: 'Order placed', description: 'Cash on Delivery order created successfully.' });
      setBuyingProduct(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setPlacingOrder(false);
    }
  };
  const selectedCategoryName = useMemo(
    () => categories.find((category) => category._id === selectedCategory)?.name,
    [categories, selectedCategory],
  );

  if (loading) return <PageLoader />;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Tags className="h-4 w-4" /> Discover products
          </p>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {searchQ ? `Results for "${searchQ}"` : 'All Products'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} product{products.length === 1 ? '' : 's'} available
            {selectedCategoryName ? ` in ${selectedCategoryName}` : ''}.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex w-full gap-2 xl:max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button className="rounded-lg bg-primary px-4 py-2 text-white">
            Search
          </button>
        </form>
      </div>

      {/* Categories */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(searchParams);
            next.delete('category');
            setSearchParams(next);
          }}
          className={`rounded-full border px-3 py-1.5 text-sm ${!selectedCategory ? 'border-primary bg-primary text-white' : ''}`}
        >
          All categories
        </button>

        {categories.map((category) => (
          <button
            key={category._id}
            type="button"
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.set('category', category._id);
              setSearchParams(next);
            }}
            className={`rounded-full border px-3 py-1.5 text-sm ${selectedCategory === category._id ? 'border-primary bg-primary text-white' : ''}`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Active Filters */}
      {(searchQ || selectedCategoryName) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {searchQ && (
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
              Search: {searchQ}
              <button
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete('search');
                  setSearchParams(next);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}

          {selectedCategoryName && (
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
              Category: {selectedCategoryName}
              <button
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete('category');
                  setSearchParams(next);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Products */}
      {products.length === 0 ? (
        <div className="py-20 text-center">
          <SlidersHorizontal className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => {
            const imageUrl = product.images?.[0]?.url || product.images?.[0]?.imageUrl || '/placeholder.svg';
            const effectivePrice = product.discountPrice || product.price;
            const discount = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
            const outOfStock = product.stock === 0;

            return (
              <div key={product._id} className="rounded-lg border bg-card p-3 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated">
                <Link to={`/product/${product._id}`} className="group block">
                  <div className="mb-3 aspect-square overflow-hidden rounded-md bg-muted">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-full w-full object-contain transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="mb-1 line-clamp-2 text-sm font-medium text-card-foreground">{product.name}</h3>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-base font-bold text-foreground">₹{effectivePrice.toLocaleString()}</span>
                    {discount > 0 && (
                      <>
                        <span className="text-xs line-through text-muted-foreground">₹{product.price.toLocaleString()}</span>
                        <span className="text-xs font-semibold text-accent">{discount}% off</span>
                      </>
                    )}
                  </div>
                  {product.stock === 0 && (
                    <span className="mt-1 inline-block text-xs font-medium text-destructive">Out of stock</span>
                  )}
                </Link>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleAddToCart(product)} disabled={outOfStock || actionLoading === `cart-${product._id}`}>
                    {actionLoading === `cart-${product._id}` ? <ButtonSpinner /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                    Cart
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAddToWishlist(product)} disabled={actionLoading === `wishlist-${product._id}`}>
                    {actionLoading === `wishlist-${product._id}` ? <ButtonSpinner /> : <Heart className="mr-2 h-4 w-4" />}
                    Wishlist
                  </Button>
                  <Button size="sm" className="col-span-2" onClick={() => openBuyDialog(product)} disabled={outOfStock}>
                    <Zap className="mr-2 h-4 w-4" /> Buy with COD
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Dialog open={!!buyingProduct} onOpenChange={(open) => !open && setBuyingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy {buyingProduct?.name}</DialogTitle>
            <DialogDescription>Enter the delivery address to place this order with Cash on Delivery only.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBuyNow} className="space-y-4">
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                max={buyingProduct?.stock || 1}
                value={buyQuantity}
                onChange={(e) => setBuyQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, buyingProduct?.stock || 1)))}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Street Address</Label>
                <Input value={address.street} onChange={(e) => setAddress((prev) => ({ ...prev, street: e.target.value }))} required className="mt-1" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={address.city} onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))} required className="mt-1" />
              </div>
              <div>
                <Label>State</Label>
                <Input value={address.state} onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))} required className="mt-1" />
              </div>
              <div>
                <Label>Country</Label>
                <Input value={address.country} onChange={(e) => setAddress((prev) => ({ ...prev, country: e.target.value }))} required className="mt-1" />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input value={address.postalCode} onChange={(e) => setAddress((prev) => ({ ...prev, postalCode: e.target.value }))} required className="mt-1" />
              </div>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <p className="font-medium text-foreground">Payment method: Cash on Delivery</p>
              <p className="mt-1 text-muted-foreground">Total: ₹{buyingProduct ? ((buyingProduct.discountPrice || buyingProduct.price) * buyQuantity).toLocaleString() : 0}</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBuyingProduct(null)}>Cancel</Button>
              <Button type="submit" disabled={placingOrder}>
                {placingOrder && <ButtonSpinner />} Place COD Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;