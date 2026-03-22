document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('app').innerHTML = uiService.dashboardShell('<div id="manageOrdersPage"></div>');
  uiService.initLayout({ withSidebar: true });
  const mount = document.getElementById('manageOrdersPage');
  try {
    const orders = await uiService.guardedRequest(() => storefrontModules.loadAllOrders(), { requireRoles: ['admin'] });
    mount.innerHTML = uiService.pageHeader({ title: 'Manage Orders', subtitle: 'Review every order created in the system.' }) + `
      <div class="card placeholder-card"><div class="table-responsive"><table class="table align-middle mb-0">
        <thead><tr><th>Order</th><th>User</th><th>Status</th><th>Total</th><th>Placed</th></tr></thead>
        <tbody>${orders.map((order) => `<tr><td>#${order._id.slice(-8)}</td><td>${order.userId?.email || '—'}</td><td><span class="badge ${uiService.getOrderStatusBadge(order.orderStatus)}">${order.orderStatus}</span></td><td>${uiService.formatCurrency(order.totalAmount)}</td><td>${uiService.formatDate(order.createdAt)}</td></tr>`).join('')}</tbody>
      </table></div></div>`;
  } catch (error) {
    mount.innerHTML = uiService.emptyState(error.message || 'Unable to load orders.', 'bi-exclamation-circle');
  }
});
