// API Service for ShopEase E-Commerce Backend
import type { Address, Cart, Category, Order, Payment, Product, Review, SellerProfile, User } from '@/lib/types';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

type RequestBody = JsonObject | FormData | Address[] | null | undefined;
interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

interface TokenResponse {
  accessToken?: string;
  refreshToken?: string;
}

interface AuthLoginResponse {
  Token?: string;
  token?: string;
}

interface AuthVerifyResponse {
  accessToken: string;
  refreshToken: string;
}

interface UserProfileResponse {
  user?: User;
  data?: User;
}

interface SellerProfileResponse {
  seller?: SellerProfile;
  data?: SellerProfile;
}

interface ProductListResponse {
  products?: Product[];
  data?: Product[];
}

interface ProductResponse {
  product?: Product;
  data?: Product;
}

interface CartResponse {
  cart?: Cart;
  data?: Cart;
}

interface WishlistResponse {
  wishlist?: { items: Product[] };
  data?: { items: Product[] };
  items?: Product[];
}

interface OrderListResponse {
  orders?: Order[];
  data?: Order[];
}

interface OrderResponse {
  order?: Order;
  data?: Order;
}

interface PaymentListResponse {
  payments?: Payment[];
  data?: Payment[];
}

interface ReviewListResponse {
  reviews?: Review[];
  data?: Review[];
}

interface AdminUsersResponse {
  users?: User[];
  data?: User[];
}

interface AdminSellersResponse {
  sellers?: SellerProfile[];
  data?: SellerProfile[];
}

interface AdminCategoriesResponse {
  categories?: Category[];
  data?: Category[];
}
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data: TokenResponse = await res.json();
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      return data.accessToken;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, isFormData = false } = options;

  const token = localStorage.getItem('accessToken');
  const requestHeaders: Record<string, string> = {
    ...headers,
  };
  if (token) requestHeaders.Authorization = `Bearer ${token}`;
  if (!isFormData) requestHeaders['Content-Type'] = 'application/json';

  let res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: isFormData ? body as FormData | undefined : body ? JSON.stringify(body) : undefined,
  });

  // Token expired - try refresh
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      requestHeaders.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: isFormData ? body as FormData | undefined : body ? JSON.stringify(body) : undefined,
      });
    }
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || `Request failed with status ${res.status}`);
  }
  return data;
}

// Auth APIs
export const authApi = {
  login: (email: string) => api<AuthLoginResponse>('/auth/login', { method: 'POST', body: { email } }),
  verifyOtp: (token: string, otp: string) => api<AuthVerifyResponse>('/auth/verify', { method: 'POST', body: { token, otp } }),
  resendOtp: (token: string) => api('/auth/resend', { method: 'POST', body: { token } }),
  refresh: (refreshToken: string) => api<TokenResponse>('/auth/refresh', { method: 'POST', body: { refreshToken } }),
  logout: () => api('/auth/logout', { method: 'POST', body: { refreshToken: localStorage.getItem('refreshToken') } }),
};

// User Profile APIs
export const userApi = {
  getProfile: () => api<UserProfileResponse>('/users/profile'),
  updateProfile: (data: { name: string; phone: string; addresses: Address[] }) => api('/users/profile/update', { method: 'PUT', body: data }),
  deleteProfile: () => api('/users/profile/delete-account', { method: 'DELETE' }),
};

// Seller APIs
export const sellerApi = {
  register: (data: { shopName: string; shopDescription: string; businessAddress: string; bankDetails: { accountNumber: string; ifscCode: string; bankName: string } }) => api('/seller/register', { method: 'POST', body: data }),
  getProfile: () => api<SellerProfileResponse>('/seller/profile'),
  updateProfile: (data: SellerProfile) => api('/seller/profile/update', { method: 'PUT', body: data }),
  deleteProfile: () => api('/seller/profile/delete-account', { method: 'DELETE' }),
  getMyProducts: () => api<ProductListResponse>('/product/seller/my-products'),
};

// Product APIs
export const productApi = {
  getAll: (params?: string) => api<ProductListResponse>(`/product/all${params ? `?${params}` : ''}`),
  getById: (id: string) => api<ProductResponse>(`/product/${id}`),
  create: (formData: FormData) => api('/product/create', { method: 'POST', body: formData, isFormData: true }),
  update: (id: string, data: Partial<Product>) => api(`/product/${id}/update`, { method: 'PUT', body: data }),
  updateStock: (id: string, data: { stock: number }) => api(`/product/${id}/stock`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/product/${id}/delete`, { method: 'DELETE' }),
};

// Cart APIs
export const cartApi = {
  get: () => api<CartResponse>('/users/carts'),
  add: (productId: string, quantity = 1) => api('/users/carts/add', { method: 'POST', body: { productId, quantity } }),
  update: (productId: string, quantity: number) => api(`/users/carts/update/${productId}`, { method: 'PUT', body: { quantity } }),
  remove: (productId: string) => api(`/users/carts/delete/${productId}`, { method: 'DELETE' }),
  clear: () => api('/users/carts/clear', { method: 'DELETE' }),
};

// Wishlist APIs
export const wishlistApi = {
  get: () => api<WishlistResponse>('/users/wishlists'),
  add: (productId: string) => api('/users/wishlists/add', { method: 'POST', body: { productId } }),
  remove: (productId: string) => api(`/users/wishlists/remove/${productId}`, { method: 'DELETE' }),
};

// Order APIs
export const orderApi = {
  create: (data: { shippingAddress: Address; directItem?: { productId: string; quantity: number; price?: number } }) => api<OrderResponse>('/shopease/create', { method: 'POST', body: data }),
  getMyOrders: () => api<OrderListResponse>('/shopease/my-orders'),
  getAll: () => api<OrderListResponse>('/shopease/orders'),
  getById: (id: string) => api<OrderResponse>(`/shopease/${id}`),
  updateStatus: (id: string, status: string) => api(`/shopease/${id}/status`, { method: 'PATCH', body: { orderStatus: status } }),
  cancel: (id: string) => api(`/shopease/${id}/cancel`, { method: 'PATCH' }),
  reject: (id: string) => api(`/shopease/${id}/reject`, { method: 'PATCH' }),
};

// Payment APIs
export const paymentApi = {
 create: (data: { orderId: string; paymentMethod: string; transactionId: string; amount?: number }) => api('/secure/create', { method: 'POST', body: data }),
  getPending: () => api<PaymentListResponse>('/secure/pending'),
  approve: (orderId: string) => api(`/secure/payment/${orderId}/approve`, { method: 'PATCH' }),
  reject: (orderId: string) => api(`/secure/payment/${orderId}/reject`, { method: 'PATCH' }),
};

// Review APIs
export const reviewApi = {
  add: (data: { productId: string; rating: number; comment: string }) => api('/reviews/add', { method: 'POST', body: data }),
  getByProduct: (productId: string) => api<ReviewListResponse>(`/reviews/product/${productId}`),
  update: (id: string, data: { rating?: number; comment?: string }) => api(`/reviews/update/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/reviews/delete/${id}`, { method: 'DELETE' }),
};

// Admin APIs
export const adminApi = {
  getAllUsers: () => api<AdminUsersResponse>('/admin/users'),
  getUser: (id: string) => api<User>(`/admin/user/${id}`),
  blockUser: (userId: string) => api('/admin/block-user', { method: 'PATCH', body: { userId } }),
  unblockUser: (userId: string) => api('/admin/unblock-user', { method: 'PATCH', body: { userId } }),
  getPendingSellers: () => api<AdminSellersResponse>('/admin/sellers/pending'),
  verifySeller: (id: string) => api(`/admin/seller/verify/${id}`, { method: 'PATCH' }),
  rejectSeller: (id: string) => api(`/admin/seller/reject/${id}`, { method: 'PATCH' }),
  getAllSellers: () => api<AdminSellersResponse>('/admin/sellers'),
  getSeller: (id: string) => api<SellerProfile>(`/admin/seller/${id}`),
  blockSeller: (sellerId: string) => api('/admin/block-seller', { method: 'PATCH', body: { sellerId } }),
  unblockSeller: (sellerId: string) => api('/admin/unblock-seller', { method: 'PATCH', body: { sellerId } }),
  getPendingProducts: () => api<ProductListResponse>('/admin/products/pending'),
  verifyProduct: (id: string) => api(`/admin/product/verify/${id}`, { method: 'PATCH' }),
  rejectProduct: (id: string) => api(`/admin/product/reject/${id}`, { method: 'PATCH' }),
};

// Category APIs (Admin)
export const categoryApi = {
  create: (data: { name: string; description: string; parentCategory?: string | null }) => api('/admin/category', { method: 'POST', body: data }),
  getAll: () => api<AdminCategoriesResponse>('/admin/categories'),
  getById: (id: string) => api<Category>(`/admin/category/${id}`),
  update: (id: string, data: Partial<Category>) => api(`/admin/category/${id}/update`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/admin/category/${id}/delete`, { method: 'DELETE' }),
};


// Health check
export const healthCheck = () => api('/health');
