import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Link } from "react-router-dom";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import WishlistPage from "./pages/WishlistPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<ProtectedRoute roles={['buyer']}><CartPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute roles={['buyer']}><CheckoutPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute roles={['buyer']}><OrdersPage /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute roles={['buyer']}><WishlistPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/seller" element={<ProtectedRoute roles={['buyer', 'seller']}><SellerDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {/* Footer */}
          

<footer className="border-t bg-card py-10">
  <div className="page-container grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">

    {/* Brand */}
    <div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-2">
        Shop<span className="text-secondary">Ease</span>
      </h2>
      <p className="text-muted-foreground">
        Your one-stop destination for all your shopping needs. Fast delivery, best prices.
      </p>
    </div>

    {/* Quick Links */}
    <div>
      <h3 className="font-semibold text-foreground mb-3">Quick Links</h3>
      <ul className="space-y-2 text-muted-foreground">
        <li><Link to="/" className="hover:text-foreground">Home</Link></li>
        <li><Link to="/products" className="hover:text-foreground">Shop</Link></li>
        <li><Link to="/orders" className="hover:text-foreground">Orders</Link></li>
      </ul>
    </div>

    {/* Contact */}
    <div>
      <h3 className="font-semibold text-foreground mb-3">Contact Us</h3>
      <p className="text-muted-foreground">
        Email: 
        <a 
          href="mailto:mrrajprasad5@gmail.com" 
          className="hover:text-foreground ml-1"
        >
          mrrajprasad5@gmail.com
        </a>
      </p>
    </div>

  </div>

  {/* Bottom Bar */}
  <div className="border-t mt-8 pt-4 text-center text-muted-foreground text-sm">
    <p>
      © {new Date().getFullYear()} 
      <span className="font-semibold text-foreground ml-1">ShopEase</span>. All rights reserved.
    </p>
  </div>
</footer>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
