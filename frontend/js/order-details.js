document.addEventListener('DOMContentLoaded', async () => {
  uiService.initLayout();
  const mount = document.getElementById('orderDetailsApp');
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('id');
  if (!orderId) {
    mount.innerHTML = uiService.emptyState('Order id is missing.', 'bi-exclamation-circle');
    return;
  }
  try {
    const response = await uiService.guardedRequest(() => apiService.get(API_CONFIG.endpoints.orders.details(orderId)));
    const order = response.order;
    mount.innerHTML = `
      <div class="card placeholder-card"><div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div><h1 class="h3 mb-1">Order #${order._id.slice(-8)}</h1><p class="text-muted mb-0">Placed ${uiService.formatDate(order.createdAt)}</p></div>
          <span class="badge ${uiService.getOrderStatusBadge(order.orderStatus)}">${order.orderStatus}</span>
        </div>
        <div class="row g-4 mb-4">
          <div class="col-md-4"><div class="border rounded-3 p-3"><div class="text-muted small">Total</div><div class="fw-semibold">${uiService.formatCurrency(order.totalAmount)}</div></div></div>
          <div class="col-md-4"><div class="border rounded-3 p-3"><div class="text-muted small">Payment</div><div class="fw-semibold text-capitalize">${order.paymentStatus || 'pending'}</div></div></div>
          <div class="col-md-4"><div class="border rounded-3 p-3"><div class="text-muted small">Items</div><div class="fw-semibold">${order.items?.length || 0}</div></div></div>
        </div>
        <h2 class="h5 mb-3">Shipping address</h2>
        <p class="text-muted">${Object.values(order.shippingAddress || {}).filter(Boolean).join(', ') || 'No address available.'}</p>
      </div></div>`;
  } catch (error) {
    mount.innerHTML = uiService.emptyState(error.message || 'Unable to load order details.', 'bi-exclamation-circle');
  }
});
