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
    { href: 'seller-orders.html', icon: 'bi-receipt', label: 'Seller Orders' }
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

    const dashboardMap = {
      buyer: 'user-dashboard.html',
      seller: 'seller-dashboard.html',
      admin: 'admin-dashboard.html',
      superadmin: 'superadmin-dashboard.html'
    };

    area.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="../pages/home.html">Home</a></li>
      <li class="nav-item"><a class="nav-link" href="../pages/cart.html">Cart</a></li>
      <li class="nav-item"><a class="nav-link" href="../pages/wishlist.html">Wishlist</a></li>
      <li class="nav-item"><a class="nav-link" href="../pages/${dashboardMap[user.role] || 'user-dashboard.html'}">${user.roleLabel} panel</a></li>
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
      url.searchParams.set('search', query);
      url.pathname = url.pathname.replace(/[^/]+$/, 'home.html');
      window.location.href = url.toString();
    });
  },

  getOrderStatusBadge(status = '') {
    const map = {
      created: 'secondary',
      pending_payment: 'warning',
      payment_failed: 'danger',
      paid: 'info',
      shipped: 'primary',
      out_for_delivery: 'primary',
      delivered: 'success',
      cancelled: 'dark'
    };
    return `bg-${map[status] || 'secondary'}`;
  }
};

window.uiService = uiService;
