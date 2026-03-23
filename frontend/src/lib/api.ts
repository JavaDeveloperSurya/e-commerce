// API Service for ShopEase E-Commerce Backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
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
    const data = await res.json();
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

export async function api<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, isFormData = false } = options;

  const token = localStorage.getItem('accessToken');
  const requestHeaders: Record<string, string> = {
    ...headers,
  };
  if (token) requestHeaders['Authorization'] = `Bearer ${token}`;
  if (!isFormData) requestHeaders['Content-Type'] = 'application/json';

  let res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  // Token expired - try refresh
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      requestHeaders['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      });
    }
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

// Auth APIs
export const authApi = {
  login: (email: string) => api('/auth/login', { method: 'POST', body: { email } }),
  verifyOtp: (token: string, otp: string) => api('/auth/verify', { method: 'POST', body: { token, otp } }),
  resendOtp: (token: string) => api('/auth/resend', { method: 'POST', body: { token } }),
  refresh: (refreshToken: string) => api('/auth/refresh', { method: 'POST', body: { refreshToken } }),
  logout: () => api('/auth/logout', { method: 'POST', body: { refreshToken: localStorage.getItem('refreshToken') } }),
};

// User Profile APIs
export const userApi = {
  getProfile: () => api('/users/profile'),
  updateProfile: (data: any) => api('/users/profile/update', { method: 'PUT', body: data }),
  deleteProfile: () => api('/users/profile/delete-account', { method: 'DELETE' }),
};

// Seller APIs
export const sellerApi = {
  register: (data: any) => api('/seller/register', { method: 'POST', body: data }),
  getProfile: () => api('/seller/profile'),
  updateProfile: (data: any) => api('/seller/profile/update', { method: 'PUT', body: data }),
  deleteProfile: () => api('/seller/profile/delete-account', { method: 'DELETE' }),
  getMyProducts: () => api('/product/seller/my-products'),
};

// Product APIs
export const productApi = {
  getAll: (params?: string) => api(`/product/all${params ? `?${params}` : ''}`),
  getById: (id: string) => api(`/product/${id}`),
  create: (formData: FormData) => api('/product/create', { method: 'POST', body: formData, isFormData: true }),
  update: (id: string, data: any) => api(`/product/${id}/update`, { method: 'PUT', body: data }),
  updateStock: (id: string, data: any) => api(`/product/${id}/stock`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/product/${id}/delete`, { method: 'DELETE' }),
};

// Cart APIs
export const cartApi = {
  get: () => api('/users/carts'),
  add: (productId: string, quantity: number = 1) => api('/users/carts/add', { method: 'POST', body: { productId, quantity } }),
  update: (productId: string, quantity: number) => api(`/users/carts/update/${productId}`, { method: 'PUT', body: { quantity } }),
  remove: (productId: string) => api(`/users/carts/delete/${productId}`, { method: 'DELETE' }),
  clear: () => api('/users/carts/clear', { method: 'DELETE' }),
};

// Wishlist APIs
export const wishlistApi = {
  get: () => api('/users/wishlists'),
  add: (productId: string) => api('/users/wishlists/add', { method: 'POST', body: { productId } }),
  remove: (productId: string) => api(`/users/wishlists/remove/${productId}`, { method: 'DELETE' }),
};

// Order APIs
export const orderApi = {
  create: (data: any) => api('/shopease/create', { method: 'POST', body: data }),
  getMyOrders: () => api('/shopease/my-orders'),
  getAll: () => api('/shopease/orders'),
  getById: (id: string) => api(`/shopease/${id}`),
  updateStatus: (id: string, status: string) => api(`/shopease/${id}/status`, { method: 'PATCH', body: { orderStatus: status } }),
  cancel: (id: string) => api(`/shopease/${id}/cancel`, { method: 'PATCH' }),
  reject: (id: string) => api(`/shopease/${id}/reject`, { method: 'PATCH' }),
};

// Payment APIs
export const paymentApi = {
  create: (data: any) => api('/secure/create', { method: 'POST', body: data }),
  getPending: () => api('/secure/pending'),
  approve: (orderId: string) => api(`/secure/payment/${orderId}/approve`, { method: 'PATCH' }),
  reject: (orderId: string) => api(`/secure/payment/${orderId}/reject`, { method: 'PATCH' }),
};

// Review APIs
export const reviewApi = {
  add: (data: any) => api('/reviews/add', { method: 'POST', body: data }),
  getByProduct: (productId: string) => api(`/reviews/product/${productId}`),
  update: (id: string, data: any) => api(`/reviews/update/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/reviews/delete/${id}`, { method: 'DELETE' }),
};

// Admin APIs
export const adminApi = {
  getAllUsers: () => api('/admin/users'),
  getUser: (id: string) => api(`/admin/user/${id}`),
  blockUser: (userId: string) => api('/admin/block-user', { method: 'PATCH', body: { userId } }),
  unblockUser: (userId: string) => api('/admin/unblock-user', { method: 'PATCH', body: { userId } }),
  getPendingSellers: () => api('/admin/sellers/pending'),
  verifySeller: (id: string) => api(`/admin/seller/verify/${id}`, { method: 'PATCH' }),
  rejectSeller: (id: string) => api(`/admin/seller/reject/${id}`, { method: 'PATCH' }),
  getAllSellers: () => api('/admin/sellers'),
  getSeller: (id: string) => api(`/admin/seller/${id}`),
  blockSeller: (sellerId: string) => api('/admin/block-seller', { method: 'PATCH', body: { sellerId } }),
  unblockSeller: (sellerId: string) => api('/admin/unblock-seller', { method: 'PATCH', body: { sellerId } }),
  getPendingProducts: () => api('/admin/products/pending'),
  verifyProduct: (id: string) => api(`/admin/product/verify/${id}`, { method: 'PATCH' }),
  rejectProduct: (id: string) => api(`/admin/product/reject/${id}`, { method: 'PATCH' }),
};

// Category APIs (Admin)
export const categoryApi = {
  create: (data: any) => api('/admin/category', { method: 'POST', body: data }),
  getAll: () => api('/admin/categories/all'),
  getById: (id: string) => api(`/admin/category/${id}`),
  update: (id: string, data: any) => api(`/admin/category/${id}/update`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/admin/category/${id}/delete`, { method: 'DELETE' }),
};

// Health check
export const healthCheck = () => api('/health');
