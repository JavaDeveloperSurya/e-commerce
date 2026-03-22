document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('app').innerHTML = uiService.dashboardShell('<div id="userDashboardPage"></div>');
  uiService.initLayout({ withSidebar: true });
  const mount = document.getElementById('userDashboardPage');

  try {
    const [profile, cart, wishlist, orders] = await Promise.all([
      uiService.guardedRequest(() => storefrontModules.loadProfile(), { requireRoles: ['buyer'] }),
      uiService.guardedRequest(() => storefrontModules.loadCart(), { requireRoles: ['buyer'] }),
      uiService.guardedRequest(() => storefrontModules.loadWishlist(), { requireRoles: ['buyer'] }),
      uiService.guardedRequest(() => storefrontModules.loadMyOrders(), { requireRoles: ['buyer'] })
    ]);

    mount.innerHTML = uiService.pageHeader({ title: `Welcome${profile?.name ? `, ${profile.name}` : ''}`, subtitle: 'Track your activity across cart, wishlist, and orders.' }) +
      uiService.statsCards([
        { label: 'Cart Items', value: cart?.items?.length || 0, meta: 'Products waiting for checkout' },
        { label: 'Wishlist', value: wishlist?.products?.length || 0, meta: 'Saved for later' },
        { label: 'Orders', value: orders?.length || 0, meta: 'Placed from this account' },
        { label: 'Profile', value: profile?.isProfileCompleted ? 'Complete' : 'Pending', meta: profile?.email || '' }
      ]) +
      `<div class="row g-4">
        <div class="col-lg-7"><div class="card placeholder-card"><div class="card-body p-4"><h2 class="h5 mb-3">Recent orders</h2>${orders?.length ? `<div class="d-grid gap-3">${orders.slice(0, 3).map((order) => `<a class="text-decoration-none text-reset border rounded-3 p-3" href="order-details.html?id=${order._id}"><div class="d-flex justify-content-between"><strong>#${order._id.slice(-8)}</strong><span class="badge ${uiService.getOrderStatusBadge(order.orderStatus)}">${order.orderStatus}</span></div><div class="small text-muted mt-2">${uiService.formatCurrency(order.totalAmount)} • ${uiService.formatDate(order.createdAt)}</div></a>`).join('')}</div>` : '<p class="text-muted mb-0">No orders yet.</p>'}</div></div></div>
        <div class="col-lg-5"><div class="card placeholder-card"><div class="card-body p-4"><h2 class="h5 mb-3">Quick actions</h2><div class="d-grid gap-2"><a class="btn btn-dark" href="home.html">Browse Products</a><a class="btn btn-outline-dark" href="cart.html">Open Cart</a><a class="btn btn-outline-dark" href="wishlist.html">Open Wishlist</a><a class="btn btn-outline-dark" href="profile.html">Edit Profile</a></div></div></div></div>
      </div>`;
  } catch (error) {
    mount.innerHTML = uiService.emptyState(error.message || 'Unable to load dashboard.', 'bi-exclamation-circle');
  }
});
