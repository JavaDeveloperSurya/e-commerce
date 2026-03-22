document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('app').innerHTML = uiService.dashboardShell('<div id="approveProductsPage"></div>');
  uiService.initLayout({ withSidebar: true });
  const mount = document.getElementById('approveProductsPage');
  try {
    const products = await uiService.guardedRequest(() => storefrontModules.loadPendingProducts(), { requireRoles: ['admin'] });
    mount.innerHTML = uiService.pageHeader({ title: 'Approve Products', subtitle: 'Approve or reject newly submitted seller products.' }) + (products.length ? `<div class="row g-4">${products.map((product) => `<div class="col-md-6">${storefrontModules.cardProduct(product, `<div class="d-flex gap-2"><button class="btn btn-success flex-fill" data-approve-id="${product._id}">Approve</button><button class="btn btn-outline-danger flex-fill" data-reject-id="${product._id}">Reject</button></div>`)}</div>`).join('')}</div>` : uiService.emptyState('No pending products found.', 'bi-patch-check'));

    mount.addEventListener('click', async (event) => {
      const approveBtn = event.target.closest('[data-approve-id]');
      const rejectBtn = event.target.closest('[data-reject-id]');
      if (approveBtn) {
        await uiService.guardedRequest(() => apiService.patch(API_CONFIG.endpoints.admin.verifyProduct(approveBtn.dataset.approveId), {}), { requireRoles: ['admin'] });
        window.location.reload();
      }
      if (rejectBtn) {
        await uiService.guardedRequest(() => apiService.patch(API_CONFIG.endpoints.admin.rejectProduct(rejectBtn.dataset.rejectId), { reason: 'Rejected from admin panel' }), { requireRoles: ['admin'] });
        window.location.reload();
      }
    });
  } catch (error) {
    mount.innerHTML = uiService.emptyState(error.message || 'Unable to load pending products.', 'bi-exclamation-circle');
  }
});
