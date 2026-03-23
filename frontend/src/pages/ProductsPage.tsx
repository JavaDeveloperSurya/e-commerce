import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categoryApi, productApi } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { PageLoader } from '@/components/Spinner';
import { useToast } from '@/hooks/use-toast';
import { Search, SlidersHorizontal, Tags, X } from 'lucide-react';
import type { Category, Product } from '@/lib/types';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const searchQ = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const [localSearch, setLocalSearch] = useState(searchQ);

  useEffect(() => {
    setLocalSearch(searchQ);
  }, [searchQ]);

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
  }, [searchQ, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localSearch) next.set('search', localSearch);
    else next.delete('search');
    setSearchParams(next);
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
          <button className="px-4 py-2 bg-primary text-white rounded-lg">
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
          className={`rounded-full border px-3 py-1.5 text-sm ${
            !selectedCategory ? 'border-primary bg-primary text-white' : ''
          }`}
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
            className={`rounded-full border px-3 py-1.5 text-sm ${
              selectedCategory === category._id
                ? 'border-primary bg-primary text-white'
                : ''
            }`}
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
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;