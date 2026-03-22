document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('app').innerHTML = uiService.dashboardShell('<div id="sellerDashboardPage"></div>');
  uiService.initLayout({ withSidebar: true });
  const mount = document.getElementById('sellerDashboardPage');
  try {
    const [profile, products, payments] = await Promise.allSettled([
      uiService.guardedRequest(() => storefrontModules.loadSellerProfile(), { requireRoles: ['seller'] }),
      uiService.guardedRequest(() => storefrontModules.loadSellerProductsFallback(), { requireRoles: ['seller'] }),
      uiService.guardedRequest(() => apiService.get(API_CONFIG.endpoints.payments.pending), { requireRoles: ['seller'] })
    ]);
    const sellerProfile = profile.status === 'fulfilled' ? profile.value : null;
    const sellerProducts = products.status === 'fulfilled' ? products.value : [];
    const pendingPayments = payments.status === 'fulfilled' ? (payments.value.data || []) : [];
    mount.innerHTML = uiService.pageHeader({ title: sellerProfile?.shopName || 'Seller Dashboard', subtitle: 'Monitor products, payments, and store approval.' , actionHtml: '<a href="add-product.html" class="btn btn-dark">Add Product</a>'}) +
      uiService.statsCards([
        { label: 'Approval Status', value: sellerProfile?.approvalStatus || 'Unknown', meta: 'Seller verification state' },
        { label: 'Products', value: sellerProducts.length, meta: 'Catalog items linked to your account' },
        { label: 'Pending Payments', value: pendingPayments.length, meta: 'Awaiting seller action' },
        { label: 'Store Email', value: sellerProfile?.userId?.email || '—', meta: sellerProfile?.userId?.name || '' }
      ]) +
      `<div class="card placeholder-card"><div class="card-body p-4"><h2 class="h5 mb-3">Store snapshot</h2><p class="text-muted">${sellerProfile?.shopDescription || 'Add a shop description to make your storefront stronger.'}</p><p class="mb-0"><strong>Business address:</strong> ${sellerProfile?.businessAddress || 'Not provided'}</p></div></div>`;
  } catch (error) {
    mount.innerHTML = uiService.emptyState(error.message || 'Unable to load seller dashboard.', 'bi-exclamation-circle');
  }
});
