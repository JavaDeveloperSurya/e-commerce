const storefrontModules = {
  async loadProduct(productId) {
    const [productResponse, reviewResponse] = await Promise.allSettled([
      apiService.get(API_CONFIG.endpoints.products.details(productId)),
      apiService.get(API_CONFIG.endpoints.reviews.list(productId))
    ]);

    return {
      product: productResponse.status === 'fulfilled' ? productResponse.value.product : null,
      reviews: reviewResponse.status === 'fulfilled' ? (reviewResponse.value.data || []) : []
    };
  },

  async loadCart() {
    const response = await apiService.get(API_CONFIG.endpoints.cart.get);
    return response.data || { items: [], totalAmount: 0 };
  },

  async loadWishlist() {
    const response = await apiService.get(API_CONFIG.endpoints.wishlist.get);
    return response.data || { products: [] };
  },

  async loadProfile() {
    const response = await apiService.get(API_CONFIG.endpoints.profile.get);
    return response.user;
  },

  async loadMyOrders() {
    const response = await apiService.get(API_CONFIG.endpoints.orders.myOrders);
    return response.order ? [response.order] : (response.orders || []);
  },

  async loadAllOrders() {
    const response = await apiService.get(API_CONFIG.endpoints.orders.all);
    return response.orders || [];
  },

  async loadAdminUsers() {
    const response = await apiService.get(API_CONFIG.endpoints.admin.users);
    return response.users || [];
  },

  async loadPendingProducts() {
    const response = await apiService.get(API_CONFIG.endpoints.admin.pendingProducts);
    return response.products || [];
  },

  async loadSellerProfile() {
    const response = await apiService.get(API_CONFIG.endpoints.seller.profile);
    return response.sellerProfile;
  },

  async loadSellerProductsFallback() {
    const productsResponse = await apiService.get(API_CONFIG.endpoints.products.list);
    const products = productsResponse.products || [];
    const currentUser = authService.getCurrentUser();
    return products.filter((product) => {
      const sellerUserId = product?.sellerId?.userId?._id || product?.sellerId?.userId;
      return sellerUserId && sellerUserId === currentUser?.userId;
    });
  },

  cardProduct(product, extraActions = '') {
    const image = uiService.resolveProductImage(product);
    const price = product.discountPrice || product.price;
    return `
      <div class="card product-card h-100">
        <img src="${image}" alt="${product.name}" class="card-img-top">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between gap-2 mb-2">
            <span class="badge badge-soft">${product.categoryId?.name || 'General'}</span>
            <span class="badge text-bg-${product.stock > 0 ? 'success' : 'secondary'}">${product.stock > 0 ? 'In stock' : 'Out of stock'}</span>
          </div>
          <h5 class="card-title">${product.name}</h5>
          <p class="text-muted small flex-grow-1">${(product.description || 'No description').slice(0, 90)}...</p>
          <div class="mb-2">${uiService.renderStars(product.ratingAverage || 0)}</div>
          <div class="fw-bold fs-5 mb-3">${uiService.formatCurrency(price)}</div>
          <div class="d-grid gap-2">
            <a href="product-details.html?id=${product._id}" class="btn btn-dark">View Details</a>
            ${extraActions}
          </div>
        </div>
      </div>
    `;
  }
};

window.storefrontModules = storefrontModules;
