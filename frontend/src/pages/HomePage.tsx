import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Truck, Shield, ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24" style={{ background: 'var(--gradient-hero)' }}>
        <div className="page-container relative z-10">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-4 leading-tight">
              Shop the Best Deals on <span className="text-secondary">ShopEase</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
              Discover thousands of products from verified sellers. Fast delivery, secure payments, and amazing prices.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" /> Browse Products
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20" asChild>
                <Link to="/login">
                  Start Selling <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_50%,white,transparent_60%)]" />
      </section>

      {/* Features */}
      <section className="py-12 bg-card border-b">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: 'Fast Delivery', desc: 'Get your orders delivered quickly and on time.' },
              { icon: Shield, title: 'Secure Payments', desc: 'Multiple payment options with end-to-end security.' },
              { icon: ShoppingBag, title: 'Verified Sellers', desc: 'Shop from admin-verified sellers you can trust.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-5 rounded-lg bg-background border">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="page-container text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Ready to Start Shopping?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Browse our collection of products from top sellers across categories.
          </p>
          <Button size="lg" asChild>
            <Link to="/products">Explore Products <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
