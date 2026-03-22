document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('app').innerHTML = uiService.dashboardShell('<div id="ordersPage"></div>');
  uiService.initLayout({ withSidebar: true });
  const mount = document.getElementById('ordersPage');
  try {
    const orders = await uiService.guardedRequest(() => storefrontModules.loadMyOrders(), { requireRoles: ['buyer'] });
    if (!orders) return;
    mount.innerHTML = uiService.pageHeader({ title: 'My Orders', subtitle: 'Track all orders placed from your ShopEase account.' }) + (orders.length ? `
      <div class="card placeholder-card"><div class="table-responsive"><table class="table align-middle mb-0">
        <thead><tr><th>Order</th><th>Status</th><th>Total</th><th>Date</th><th></th></tr></thead>
        <tbody>${orders.map((order) => `<tr>
          <td>#${order._id?.slice(-8) || 'N/A'}</td>
          <td><span class="badge ${uiService.getOrderStatusBadge(order.orderStatus)}">${order.orderStatus}</span></td>
          <td>${uiService.formatCurrency(order.totalAmount)}</td>
          <td>${uiService.formatDate(order.createdAt)}</td>
          <td><a class="btn btn-sm btn-outline-dark" href="order-details.html?id=${order._id}">Details</a></td>
        </tr>`).join('')}</tbody>
      </table></div></div>` : uiService.emptyState('No orders found yet.', 'bi-box-seam'));
  } catch (error) {
    mount.innerHTML = uiService.emptyState(error.message || 'Unable to load orders.', 'bi-exclamation-circle');
  }
});
