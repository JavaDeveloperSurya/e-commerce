document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('app').innerHTML = uiService.dashboardShell('<div id="adminDashboardPage"></div>');
  uiService.initLayout({ withSidebar: true });
  const mount = document.getElementById('adminDashboardPage');
  try {
    const [users, pendingProducts, orders] = await Promise.all([
      uiService.guardedRequest(() => storefrontModules.loadAdminUsers(), { requireRoles: ['admin'] }),
      uiService.guardedRequest(() => storefrontModules.loadPendingProducts(), { requireRoles: ['admin'] }),
      uiService.guardedRequest(() => storefrontModules.loadAllOrders(), { requireRoles: ['admin'] })
    ]);
    mount.innerHTML = uiService.pageHeader({ title: 'Admin Dashboard', subtitle: 'Monitor platform users, orders, and product approvals.' }) +
      uiService.statsCards([
        { label: 'Users', value: users.length, meta: 'All registered accounts' },
        { label: 'Pending Products', value: pendingProducts.length, meta: 'Awaiting approval' },
        { label: 'Orders', value: orders.length, meta: 'Total platform orders' },
        { label: 'Blocked Users', value: users.filter((user) => user.isBlocked).length, meta: 'Currently blocked' }
      ]) +
      `<div class="row g-4">
        <div class="col-lg-6"><div class="card placeholder-card"><div class="card-body p-4"><h2 class="h5 mb-3">Quick actions</h2><div class="d-grid gap-2"><a class="btn btn-dark" href="approve-products.html">Review pending products</a><a class="btn btn-outline-dark" href="manage-users.html">Manage users</a><a class="btn btn-outline-dark" href="manage-orders.html">Manage orders</a></div></div></div></div>
        <div class="col-lg-6"><div class="card placeholder-card"><div class="card-body p-4"><h2 class="h5 mb-3">Latest orders</h2>${orders.length ? `<div class="d-grid gap-3">${orders.slice(0,3).map((order) => `<div class="border rounded-3 p-3"><div class="d-flex justify-content-between"><strong>#${order._id.slice(-8)}</strong><span class="badge ${uiService.getOrderStatusBadge(order.orderStatus)}">${order.orderStatus}</span></div><div class="small text-muted mt-2">${order.userId?.email || 'User'} • ${uiService.formatCurrency(order.totalAmount)}</div></div>`).join('')}</div>` : '<p class="text-muted mb-0">No orders found.</p>'}</div></div></div>
      </div>`;
  } catch (error) {
    mount.innerHTML = uiService.emptyState(error.message || 'Unable to load admin dashboard.', 'bi-exclamation-circle');
  }
});
