import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { PageLoader } from '@/components/Spinner';
import { useToast } from '@/hooks/use-toast';
import { Search, SlidersHorizontal } from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const searchQ = searchParams.get('search') || '';
  const [localSearch, setLocalSearch] = useState(searchQ);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQ) params.set('search', searchQ);
    productApi.getAll(params.toString())
      .then(data => setProducts(data.products || data.data || []))
      .catch(err => toast({ title: 'Error', description: err.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [searchQ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(localSearch ? { search: localSearch } : {});
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">
          {searchQ ? `Results for "${searchQ}"` : 'All Products'}
        </h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <SlidersHorizontal className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
