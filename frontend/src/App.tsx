import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
              <Route path="/seller" element={<ProtectedRoute roles={['seller']}><SellerDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {/* Footer */}
          <footer className="border-t bg-card py-8">
            <div className="page-container text-center text-sm text-muted-foreground">
              <p className="font-display font-semibold text-foreground mb-1">Shop<span className="text-secondary">Ease</span></p>
              <p>© {new Date().getFullYear()} ShopEase. All rights reserved.</p>
            </div>
          </footer>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
