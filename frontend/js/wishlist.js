document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('app').innerHTML = uiService.dashboardShell('<div id="wishlistPage"></div>');
  uiService.initLayout({ withSidebar: true });
  const mount = document.getElementById('wishlistPage');
  try {
    const wishlist = await uiService.guardedRequest(() => storefrontModules.loadWishlist(), { requireRoles: ['buyer'] });
    if (!wishlist) return;
    const products = wishlist.products || [];
    mount.innerHTML = uiService.pageHeader({ title: 'Wishlist', subtitle: 'Save products to revisit them later.' }) + (products.length ? `<div class="row g-4">${products.map((product) => `<div class="col-md-6 col-xl-4">${storefrontModules.cardProduct(product, `<button class="btn btn-outline-danger" data-remove-id="${product._id}">Remove</button>`)}</div>`).join('')}</div>` : uiService.emptyState('Your wishlist is empty.', 'bi-heart')); 

    mount.addEventListener('click', async (event) => {
      const btn = event.target.closest('[data-remove-id]');
      if (!btn) return;
      await uiService.guardedRequest(() => apiService.delete(API_CONFIG.endpoints.wishlist.remove(btn.dataset.removeId)), { requireRoles: ['buyer'] });
      window.location.reload();
    });
  } catch (error) {
    mount.innerHTML = uiService.emptyState(error.message || 'Unable to load wishlist.', 'bi-exclamation-circle');
  }
});
