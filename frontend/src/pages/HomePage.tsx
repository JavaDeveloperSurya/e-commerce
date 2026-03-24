import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { categoryApi, productApi } from '@/lib/api';
import type { Category, Product } from '@/lib/types';
import { ShoppingBag, Truck, Shield, ArrowRight, Sparkles, Tags } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([
      productApi.getAll().catch(() => ({ products: [] })),
      categoryApi.getAll().catch(() => ({ categories: [] })),
    ]).then(([productData, categoryData]) => {
      setFeaturedProducts((productData.products || []));
      setCategories((categoryData.categories || []).slice(0, 6));
    });
  }, []);

  const stats = useMemo(() => [
    { label: 'Featured products', value: featuredProducts.length || '100+' },
    { label: 'Live categories', value: categories.length || '10+' },
    { label: 'Seller support', value: '24/7' },
  ], [categories.length, featuredProducts.length]);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24" style={{ background: 'var(--gradient-hero)' }}>
        <div className="page-container relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1 text-sm text-primary-foreground/90">
              <Sparkles className="h-4 w-4" /> Fresh deals from verified sellers
            </div>
            <h1 className="mb-4 font-display text-4xl font-extrabold leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
              Shop smarter with curated products on <span className="text-secondary">ShopEase</span>
            </h1>
             <p className="mb-8 max-w-lg text-lg text-primary-foreground/80">
              Discover trusted sellers, simple checkout, and a cleaner shopping experience built for buyers, sellers, and admins.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" /> Browse Products
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20" asChild>
                <Link to="/seller">
                  Start Selling <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-5 text-primary-foreground backdrop-blur">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="mt-1 text-sm text-primary-foreground/75">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,white,transparent_60%)] opacity-10" />
      </section>

      {/* Features */}
      <section className="py-12 bg-card border-b">
        <div className="page-container">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
             { icon: Truck, title: 'Fast Delivery', desc: 'Track orders and receive updates throughout the fulfillment journey.' },
              { icon: Shield, title: 'Secure Payments', desc: 'Place orders with safer payment workflows and clear order statuses.' },
              { icon: ShoppingBag, title: 'Verified Sellers', desc: 'Browse catalog items approved and managed through the admin workflow.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-5 rounded-lg border bg-background p-5">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-display font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
       <section className="py-14">
        <div className="page-container">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-primary"><Tags className="h-4 w-4" /> Popular categories</p>
              <h2 className="font-display text-3xl font-bold text-foreground">Explore the catalog faster</h2>
            </div>
            <Button variant="outline" asChild>
              <Link to="/products">View all products</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                Categories will appear here once the backend has catalog data.
              </div>
            ) : categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="rounded-xl border bg-card p-5 transition-colors hover:border-primary hover:bg-primary/5"
              >
                <h3 className="font-semibold text-card-foreground">{category.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{category.description || 'Browse items in this category.'}</p>
                {category.parentCategory?.name && (
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Under {category.parentCategory.name}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-14">
        <div className="page-container">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Featured picks</p>
              <h2 className="font-display text-3xl font-bold text-foreground">Fresh arrivals shoppers can explore now</h2>
            </div>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-background p-8 text-sm text-muted-foreground">
              Featured products will appear here after approved products are added.
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
