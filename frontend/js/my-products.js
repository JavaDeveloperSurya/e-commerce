document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('app').innerHTML = uiService.dashboardShell('<div id="myProductsPage"></div>');
  uiService.initLayout({ withSidebar: true });
  const mount = document.getElementById('myProductsPage');
  try {
    const products = await uiService.guardedRequest(() => storefrontModules.loadSellerProductsFallback(), { requireRoles: ['seller'] });
    mount.innerHTML = uiService.pageHeader({ title: 'My Products', subtitle: 'Manage your current catalog.', actionHtml: '<a href="add-product.html" class="btn btn-dark">New Product</a>' }) + (products.length ? `<div class="row g-4">${products.map((product) => `<div class="col-md-6 col-xl-4">${storefrontModules.cardProduct(product, `<a href="edit-product.html?id=${product._id}" class="btn btn-outline-dark">Edit</a><button class="btn btn-outline-danger" data-delete-id="${product._id}">Delete</button>`)}</div>`).join('')}</div>` : uiService.emptyState('No seller products available yet.', 'bi-grid'));

    mount.addEventListener('click', async (event) => {
      const btn = event.target.closest('[data-delete-id]');
      if (!btn) return;
      await uiService.guardedRequest(() => apiService.delete(API_CONFIG.endpoints.products.remove(btn.dataset.deleteId), { reason: 'Removed from frontend seller panel' }), { requireRoles: ['seller'] });
      window.location.reload();
    });
  } catch (error) {
    mount.innerHTML = uiService.emptyState(error.message || 'Unable to load seller products.', 'bi-exclamation-circle');
  }
});
