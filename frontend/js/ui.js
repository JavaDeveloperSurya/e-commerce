const sidebarLinksByRole = {
  guest: [
    { href: 'home.html', icon: 'bi-house-door', label: 'Home' },
    { href: 'login.html', icon: 'bi-box-arrow-in-right', label: 'Login' },
    { href: 'register.html', icon: 'bi-person-plus', label: 'Register' }
  ],
  buyer: [
    { href: 'user-dashboard.html', icon: 'bi-speedometer2', label: 'Dashboard' },
    { href: 'cart.html', icon: 'bi-cart3', label: 'Cart' },
    { href: 'wishlist.html', icon: 'bi-heart', label: 'Wishlist' },
    { href: 'my-orders.html', icon: 'bi-box-seam', label: 'My Orders' },
    { href: 'profile.html', icon: 'bi-person', label: 'Profile' }
  ],
  seller: [
    { href: 'seller-dashboard.html', icon: 'bi-shop', label: 'Seller Dashboard' },
    { href: 'add-product.html', icon: 'bi-plus-square', label: 'Add Product' },
    { href: 'my-products.html', icon: 'bi-grid', label: 'My Products' },
    { href: 'seller-orders.html', icon: 'bi-receipt', label: 'Seller Orders' },
    { href: 'profile.html', icon: 'bi-person', label: 'Profile' }
  ],
  admin: [
    { href: 'admin-dashboard.html', icon: 'bi-shield-check', label: 'Admin Dashboard' },
    { href: 'approve-products.html', icon: 'bi-patch-check', label: 'Approve Products' },
    { href: 'manage-users.html', icon: 'bi-people', label: 'Manage Users' },
    { href: 'manage-orders.html', icon: 'bi-truck', label: 'Manage Orders' }
  ],
  superadmin: [
    { href: 'superadmin-dashboard.html', icon: 'bi-stars', label: 'Super Admin' },
    { href: 'create-admin.html', icon: 'bi-person-gear', label: 'Create Admin' }
  ]
};

const uiService = {
  initLayout({ withSidebar = false } = {}) {
    this.renderNavbar();
    this.renderSidebar(withSidebar);
    this.mountLoader();
    this.mountToastContainer();
    this.bindGlobalSearch();
  },

  async renderNavbar() {
    const host = document.getElementById('navbarMount');
    if (!host) return;
    const response = await fetch('../components/navbar.html');
    host.innerHTML = await response.text();
    this.syncNavbarAuth();
  },

  async renderSidebar(enabled) {
    const host = document.getElementById('sidebarMount');
    if (!host || !enabled) return;
    const response = await fetch('../components/sidebar.html');
    host.innerHTML = await response.text();
    this.syncSidebar();
  },

  syncNavbarAuth() {
    const area = document.getElementById('navbarAuthArea');
    const user = authService.getCurrentUser();
    if (!area || !user) return;

    area.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="../pages/home.html">Home</a></li>
      <li class="nav-item"><a class="nav-link" href="../pages/cart.html">Cart</a></li>
      <li class="nav-item"><a class="nav-link" href="../pages/wishlist.html">Wishlist</a></li>
      <li class="nav-item"><a class="nav-link" href="../pages/${authService.getDashboardUrl(user.role)}">${user.roleLabel} panel</a></li>
      <li class="nav-item"><button class="btn btn-warning btn-sm fw-semibold" id="logoutBtn">Logout</button></li>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await authService.logout();
      this.showToast('Logged out successfully', 'success');
      window.location.href = '../pages/login.html';
    });
  },

  syncSidebar() {
    const badge = document.getElementById('sidebarRoleBadge');
    const list = document.getElementById('roleBasedSidebarLinks');
    const user = authService.getCurrentUser();
    const role = user?.role || 'guest';
    const links = sidebarLinksByRole[role] || sidebarLinksByRole.guest;

    if (badge) badge.textContent = user?.roleLabel || 'Guest';
    if (!list) return;

    list.innerHTML = links.map((item) => `
      <a class="sidebar-link ${window.location.pathname.endsWith(item.href) ? 'active' : ''}" href="${item.href}">
        <i class="bi ${item.icon}"></i>
        <span>${item.label}</span>
      </a>
    `).join('');
  },

  mountLoader() {
    if (document.getElementById('globalLoader')) return;
    const loader = document.createElement('div');
    loader.id = 'globalLoader';
    loader.className = 'global-loader';
    loader.innerHTML = '<div class="spinner-border text-warning" role="status"><span class="visually-hidden">Loading...</span></div>';
    document.body.appendChild(loader);
  },

  showLoader() {
    document.getElementById('globalLoader')?.style.setProperty('display', 'flex');
  },

  hideLoader() {
    document.getElementById('globalLoader')?.style.setProperty('display', 'none');
  },

  mountToastContainer() {
    if (document.getElementById('toastContainer')) return;
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(container);
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type === 'error' ? 'danger' : type} border-0`;
    toast.role = 'alert';
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    container.appendChild(toast);
    const bootstrapToast = new bootstrap.Toast(toast, { delay: 3000 });
    bootstrapToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
  },

  bindGlobalSearch() {
    document.addEventListener('submit', (event) => {
      if (event.target?.id !== 'globalSearchForm') return;
      event.preventDefault();
      const query = document.getElementById('globalSearchInput')?.value?.trim() || '';
      const url = new URL(window.location.href);
      if (query) url.searchParams.set('search', query);
      else url.searchParams.delete('search');
      url.pathname = url.pathname.replace(/[^/]+$/, 'home.html');
      window.location.href = url.toString();
    });
  },

  renderStars(rating = 0) {
    return Array.from({ length: 5 }, (_, index) => `<i class="bi ${index < Math.round(rating) ? 'bi-star-fill text-warning' : 'bi-star text-muted'}"></i>`).join('');
  },

  formatCurrency(value = 0) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value || 0));
  },

  formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  },

  resolveProductImage(product) {
    const imageRef = product?.images?.[0];
    if (imageRef?.url) return imageRef.url;
    return 'https://placehold.co/600x400?text=ShopEase';
  },

  getOrderStatusBadge(status = '') {
    const map = {
      created: 'secondary',
      pending_payment: 'warning',
      payment_failed: 'danger',
      failed: 'danger',
      paid: 'info',
      shipped: 'primary',
      out_for_delivery: 'primary',
      delivered: 'success',
      cancelled: 'dark'
    };
    return `bg-${map[status] || 'secondary'}`;
  },

  setHtml(id, html) {
    const node = document.getElementById(id);
    if (node) node.innerHTML = html;
  },

  pageHeader({ title, subtitle, actionHtml = '' }) {
    return `
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p class="text-uppercase text-muted small mb-1">ShopEase Console</p>
          <h1 class="h3 mb-1">${title}</h1>
          <p class="text-muted mb-0">${subtitle}</p>
        </div>
        <div>${actionHtml}</div>
      </div>
    `;
  },

  dashboardShell(contentHtml) {
    return `
      <div class="container py-4 py-lg-5">
        <div class="row g-4 sidebar-shell">
          <div class="col-lg-3"><div id="sidebarMount"></div></div>
          <div class="col-lg-9">${contentHtml}</div>
        </div>
      </div>
    `;
  },

  statsCards(stats = []) {
    return `<div class="row g-3 mb-4">${stats.map((stat) => `
      <div class="col-md-6 col-xl-3">
        <div class="card placeholder-card h-100">
          <div class="card-body">
            <p class="text-muted small text-uppercase mb-2">${stat.label}</p>
            <h3 class="mb-1">${stat.value}</h3>
            <p class="text-muted mb-0 small">${stat.meta || ''}</p>
          </div>
        </div>
      </div>
    `).join('')}</div>`;
  },

  emptyState(message, icon = 'bi-inbox') {
    return `<div class="card placeholder-card"><div class="empty-state"><i class="bi ${icon} display-5 text-muted"></i><p class="mt-3 mb-0 text-muted">${message}</p></div></div>`;
  },

  async guardedRequest(callback, options = {}) {
    const { requireAuth = true, requireRoles = [] } = options;
    if (requireAuth && !authService.isAuthenticated()) {
      this.showToast('Please login to continue', 'error');
      window.location.href = 'login.html';
      return null;
    }
    if (requireRoles.length && !authService.hasRole(...requireRoles)) {
      this.showToast('You are not authorized to view this page', 'error');
      window.location.href = authService.getDashboardUrl(authService.getCurrentUser()?.role || 'buyer');
      return null;
    }

    try {
      this.showLoader();
      return await callback();
    } catch (error) {
      this.showToast(error.message || 'Request failed', 'error');
      throw error;
    } finally {
      this.hideLoader();
    }
  }
};

window.uiService = uiService;
