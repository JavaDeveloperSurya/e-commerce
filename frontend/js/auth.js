const authService = {
  roleMap: {
    buyer: 'user',
    seller: 'seller',
    admin: 'admin',
    superadmin: 'superadmin'
  },

  login(email) {
    // API integration happens here: starts OTP login flow against the backend auth route.
    return apiService.post(API_CONFIG.endpoints.auth.login, { email });
  },

  verifyOtp(token, otp) {
    return apiService.post(API_CONFIG.endpoints.auth.verifyOtp, { token, otp });
  },

  resendOtp(token) {
    return apiService.post(API_CONFIG.endpoints.auth.resendOtp, { token });
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await apiService.post(API_CONFIG.endpoints.auth.refresh, { refreshToken });
    this.persistSession(response);
    return response;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await apiService.post(API_CONFIG.endpoints.auth.logout, { refreshToken });
      } catch (error) {
        console.warn('Logout request failed:', error.message);
      }
    }
    this.clearSession();
  },

  persistSession(data) {
    if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

    const decoded = data.accessToken ? this.decodeJwt(data.accessToken) : null;
    if (decoded) {
      localStorage.setItem('currentUser', JSON.stringify({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        roleLabel: this.getRoleLabel(decoded.role)
      }));
    }
  },

  clearSession() {
    ['accessToken', 'refreshToken', 'currentUser', 'loginToken'].forEach((key) => localStorage.removeItem(key));
  },

  decodeJwt(token) {
    try {
      const base64Payload = token.split('.')[1];
      const normalized = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(normalized));
    } catch (error) {
      console.warn('Unable to decode JWT:', error.message);
      return null;
    }
  },

  getCurrentUser() {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem('accessToken'));
  },

  getRoleLabel(role) {
    return this.roleMap[role] || role || 'guest';
  },

  hasRole(...roles) {
    const user = this.getCurrentUser();
    return Boolean(user && roles.includes(user.role));
  },

  requireAuth(redirectTo = 'login.html') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }
};

window.authService = authService;
