document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('app').innerHTML = uiService.dashboardShell('<div id="cartPage"></div>');
  uiService.initLayout({ withSidebar: true });
  const mount = document.getElementById('cartPage');

  try {
    const cart = await uiService.guardedRequest(() => storefrontModules.loadCart(), { requireRoles: ['buyer'] });
    if (!cart) return;
    const items = cart.items || [];
    if (!items.length) {
      mount.innerHTML = uiService.pageHeader({ title: 'My Cart', subtitle: 'Review items before placing an order.' }) + uiService.emptyState('Your cart is empty.', 'bi-cart-x');
      return;
    }

    mount.innerHTML = uiService.pageHeader({ title: 'My Cart', subtitle: 'Review items before placing an order.', actionHtml: '<a href="home.html" class="btn btn-outline-dark">Continue Shopping</a>' }) + `
      <div class="row g-4">
        <div class="col-xl-8">
          <div class="card placeholder-card"><div class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th></th></tr></thead><tbody>
          ${items.map((item) => `<tr>
            <td><div class="d-flex align-items-center gap-3"><img src="${uiService.resolveProductImage(item.productId)}" width="70" class="rounded-3"><div><div class="fw-semibold">${item.productId?.name || 'Product'}</div></div></div></td>
            <td><input type="number" min="1" value="${item.quantity}" class="form-control form-control-sm cart-qty" data-product-id="${item.productId?._id || item.productId}" style="max-width:90px"></td>
            <td>${uiService.formatCurrency(item.price * item.quantity)}</td>
            <td><button class="btn btn-sm btn-outline-danger" data-remove-id="${item.productId?._id || item.productId}">Remove</button></td>
          </tr>`).join('')}
          </tbody></table></div></div>
        </div>
        <div class="col-xl-4">
          <div class="card placeholder-card"><div class="card-body p-4">
            <h2 class="h5 mb-3">Order Summary</h2>
            <div class="d-flex justify-content-between mb-2"><span>Total</span><strong>${uiService.formatCurrency(cart.totalAmount || 0)}</strong></div>
            <button class="btn btn-dark w-100 mt-3" id="placeOrderBtn">Place COD Order</button>
            <button class="btn btn-outline-secondary w-100 mt-2" id="clearCartBtn">Clear Cart</button>
          </div></div>
        </div>
      </div>`;

    mount.addEventListener('change', async (event) => {
      const input = event.target.closest('.cart-qty');
      if (!input) return;
      await uiService.guardedRequest(() => apiService.put(API_CONFIG.endpoints.cart.update(input.dataset.productId), { quantity: Number(input.value) }), { requireRoles: ['buyer'] });
      window.location.reload();
    });

    mount.addEventListener('click', async (event) => {
      const removeBtn = event.target.closest('[data-remove-id]');
      if (removeBtn) {
        await uiService.guardedRequest(() => apiService.delete(API_CONFIG.endpoints.cart.remove(removeBtn.dataset.removeId)), { requireRoles: ['buyer'] });
        window.location.reload();
      }
      if (event.target.id === 'clearCartBtn') {
        await uiService.guardedRequest(() => apiService.delete(API_CONFIG.endpoints.cart.clear), { requireRoles: ['buyer'] });
        window.location.reload();
      }
      if (event.target.id === 'placeOrderBtn') {
        await uiService.guardedRequest(() => apiService.post(API_CONFIG.endpoints.orders.create, { shippingAddress: { street: 'Demo street', city: 'Demo city', state: 'Demo state', country: 'India', postalCode: '000000' } }), { requireRoles: ['buyer'] });
        uiService.showToast('Order created successfully', 'success');
        setTimeout(() => window.location.href = 'my-orders.html', 800);
      }
    });
  } catch (error) {
    mount.innerHTML = uiService.emptyState(error.message || 'Unable to load cart.', 'bi-exclamation-circle');
  }
});
