document.addEventListener('DOMContentLoaded', async () => {
  uiService.initLayout();
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const app = document.getElementById('productDetailsApp');

  if (!productId) {
    app.innerHTML = uiService.emptyState('Product id is missing from the URL.', 'bi-exclamation-circle');
    return;
  }

  try {
    uiService.showLoader();
    const { product, reviews } = await storefrontModules.loadProduct(productId);
    if (!product) {
      app.innerHTML = uiService.emptyState('Product not found.', 'bi-bag-x');
      return;
    }

    app.innerHTML = `
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="card placeholder-card"><img src="${uiService.resolveProductImage(product)}" class="img-fluid rounded-4" alt="${product.name}"></div>
        </div>
        <div class="col-lg-7">
          <div class="card placeholder-card h-100">
            <div class="card-body p-4">
              <span class="badge badge-soft mb-3">${product.categoryId?.name || 'General'}</span>
              <h1 class="h2 mb-3">${product.name}</h1>
              <div class="mb-3">${uiService.renderStars(product.ratingAverage || 0)} <span class="ms-2 text-muted">${product.ratingCount || 0} ratings</span></div>
              <div class="d-flex align-items-center gap-3 mb-3">
                <span class="display-6 fw-bold">${uiService.formatCurrency(product.discountPrice || product.price)}</span>
                ${product.discountPrice ? `<span class="text-muted text-decoration-line-through">${uiService.formatCurrency(product.price)}</span>` : ''}
              </div>
              <p class="text-muted">${product.description || 'No description available.'}</p>
              <div class="row g-3 mb-4">
                <div class="col-sm-4"><div class="border rounded-3 p-3"><div class="text-muted small">Stock</div><div class="fw-semibold">${product.stock}</div></div></div>
                <div class="col-sm-4"><div class="border rounded-3 p-3"><div class="text-muted small">Approval</div><div class="fw-semibold text-capitalize">${product.status}</div></div></div>
                <div class="col-sm-4"><div class="border rounded-3 p-3"><div class="text-muted small">Active</div><div class="fw-semibold">${product.isActive ? 'Yes' : 'No'}</div></div></div>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-warning" id="detailAddCartBtn">Add to Cart</button>
                <button class="btn btn-outline-secondary" id="detailAddWishlistBtn">Add to Wishlist</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card placeholder-card mt-4">
        <div class="card-body p-4">
          <h2 class="h4 mb-3">Customer reviews</h2>
          ${reviews.length ? `<div class="d-grid gap-3">${reviews.map((review) => `<div class="border rounded-3 p-3"><div class="d-flex justify-content-between"><strong>${review.userId?.name || 'Buyer'}</strong><span>${uiService.renderStars(review.rating)}</span></div><p class="text-muted mb-0 mt-2">${review.comment}</p></div>`).join('')}</div>` : '<p class="text-muted mb-0">No reviews yet.</p>'}
        </div>
      </div>
    `;

    document.getElementById('detailAddCartBtn')?.addEventListener('click', async () => {
      await uiService.guardedRequest(() => apiService.post(API_CONFIG.endpoints.cart.add, { productId, quantity: 1 }));
      uiService.showToast('Product added to cart', 'success');
    });

    document.getElementById('detailAddWishlistBtn')?.addEventListener('click', async () => {
      await uiService.guardedRequest(() => apiService.post(API_CONFIG.endpoints.wishlist.add, { productId }));
      uiService.showToast('Product added to wishlist', 'success');
    });
  } catch (error) {
    app.innerHTML = uiService.emptyState(error.message || 'Unable to load product details.', 'bi-exclamation-circle');
  } finally {
    uiService.hideLoader();
  }
});
