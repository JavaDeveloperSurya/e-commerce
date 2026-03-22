const API_CONFIG = {
  baseURL: localStorage.getItem('apiBaseUrl') || 'http://localhost:5000/api',
  endpoints: {
    auth: {
      login: '/auth/login',
      verifyOtp: '/auth/verify',
      resendOtp: '/auth/resend',
      refresh: '/auth/refresh',
      logout: '/auth/logout'
    },
    products: {
      list: '/product/all',
      details: (id) => `/product/${id}`,
      create: '/product/create',
      sellerProducts: '/product/seller/my-products',
      update: (id) => `/product/${id}/update`,
      stock: (id) => `/product/${id}/stock`,
      remove: (id) => `/product/${id}/delete`
    },
    cart: {
      get: '/users/carts',
      add: '/users/carts/add',
      update: (productId) => `/users/carts/update/${productId}`,
      remove: (productId) => `/users/carts/delete/${productId}`,
      clear: '/users/carts/clear'
    },
    wishlist: {
      get: '/users/wishlists',
      add: '/users/wishlists/add',
      remove: (productId) => `/users/wishlists/remove/${productId}`
    },
    orders: {
      create: '/shopease/create',
      myOrders: '/shopease/my-orders',
      all: '/shopease/orders',
      details: (id) => `/shopease/${id}`,
      status: (id) => `/shopease/${id}/status`,
      cancel: (id) => `/shopease/${id}/cancel`,
      reject: (id) => `/shopease/${id}/reject`
    },
    payments: {
      create: '/secure/create',
      pending: '/secure/pending',
      approve: (orderId) => `/secure/payment/${orderId}/approve`,
      reject: (orderId) => `/secure/payment/${orderId}/reject`
    },
    reviews: {
      list: (productId) => `/reviews/product/${productId}`,
      add: '/reviews/add',
      update: (id) => `/reviews/update/${id}`,
      remove: (id) => `/reviews/delete/${id}`
    },
    profile: {
      get: '/users/profile',
      update: '/users/profile/update'
    },
    seller: {
      register: '/seller/register',
      profile: '/seller/profile',
      updateProfile: '/seller/profile/update'
    },
    admin: {
      users: '/admin/users',
      user: (id) => `/admin/user/${id}`,
      blockUser: (id) => `/admin/block-user/${id}`,
      unblockUser: (id) => `/admin/unblock-user/${id}`,
      sellers: '/admin/sellers',
      pendingSellers: '/admin/sellers/pending',
      verifySeller: (id) => `/admin/seller/verify/${id}`,
      rejectSeller: (id) => `/admin/seller/reject/${id}`,
      blockSeller: (id) => `/admin/block-seller/${id}`,
      unblockSeller: (id) => `/admin/unblock-seller/${id}`,
      pendingProducts: '/admin/products/pending',
      verifyProduct: (id) => `/admin/product/verify/${id}`,
      rejectProduct: (id) => `/admin/product/reject/${id}`
    }
  }
};

const apiService = {
  setBaseUrl(url) {
    API_CONFIG.baseURL = url.replace(/\/$/, '');
    localStorage.setItem('apiBaseUrl', API_CONFIG.baseURL);
  },

  getBaseUrl() {
    return API_CONFIG.baseURL;
  },

  getAuthHeaders(isJson = true) {
    const token = localStorage.getItem('accessToken');
    const headers = {};
    if (isJson) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  },

  async request(path, options = {}, retry = true) {
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...this.getAuthHeaders(!isFormData),
      ...(options.headers || {})
    };

    // API integration happens here: all backend communication flows through this shared request helper.
    const response = await fetch(`${API_CONFIG.baseURL}${path}`, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (response.status === 401 && retry && localStorage.getItem('refreshToken') && !path.includes('/auth/refresh')) {
      try {
        await authService.refreshToken();
        return this.request(path, options, false);
      } catch (refreshError) {
        authService.clearSession();
      }
    }

    if (!response.ok) {
      const message = payload?.message || payload?.error || 'Request failed';
      const error = new Error(message);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  },

  get(path) {
    return this.request(path, { method: 'GET' });
  },

  post(path, data, extra = {}) {
    return this.request(path, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...extra
    });
  },

  put(path, data) {
    return this.request(path, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data)
    });
  },

  patch(path, data) {
    return this.request(path, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  delete(path, data) {
    return this.request(path, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined
    });
  }
};

window.API_CONFIG = API_CONFIG;
window.apiService = apiService;
