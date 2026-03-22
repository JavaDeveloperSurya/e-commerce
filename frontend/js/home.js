const homeState = {
  products: [],
  filteredProducts: [],
  categories: [],
  page: 1,
  pageSize: 8,
  filters: {
    search: '',
    category: 'all',
    priceSort: 'default',
    availability: 'all'
  }
};

const homePage = {
  async init() {
    uiService.initLayout();
    this.bootstrapFiltersFromUrl();
    this.bindEvents();
    await this.loadInitialData();
  },

  bootstrapFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    homeState.filters.search = params.get('search') || '';
    homeState.filters.category = params.get('category') || 'all';
    homeState.filters.priceSort = params.get('sort') || 'default';
    homeState.filters.availability = params.get('availability') || 'all';
  },

  bindEvents() {
    document.addEventListener('submit', (event) => {
      if (event.target?.id === 'homeFilterForm') {
        event.preventDefault();
        homeState.page = 1;
        homeState.filters.search = document.getElementById('searchInput').value.trim();
        homeState.filters.category = document.getElementById('categoryFilter').value;
        homeState.filters.priceSort = document.getElementById('sortFilter').value;
        homeState.filters.availability = document.getElementById('availabilityFilter').value;
        this.syncUrl();
        this.applyFilters();
      }
    });

    document.addEventListener('click', async (event) => {
      const addToCartBtn = event.target.closest('[data-action="add-cart"]');
      const addToWishlistBtn = event.target.closest('[data-action="add-wishlist"]');
      const paginationBtn = event.target.closest('[data-page]');

      if (paginationBtn) {
        homeState.page = Number(paginationBtn.dataset.page);
        this.renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (addToCartBtn) {
        await this.handleProtectedAction(async () => {
          uiService.showLoader();
          // API integration happens here: add selected product into the backend cart route.
          await apiService.post(API_CONFIG.endpoints.cart.add, {
            productId: addToCartBtn.dataset.productId,
            quantity: 1
          });
          uiService.showToast('Added to cart', 'success');
        });
        uiService.hideLoader();
      }

      if (addToWishlistBtn) {
        await this.handleProtectedAction(async () => {
          uiService.showLoader();
          // API integration happens here: add selected product into the backend wishlist route.
          await apiService.post(API_CONFIG.endpoints.wishlist.add, {
            productId: addToWishlistBtn.dataset.productId
          });
          uiService.showToast('Added to wishlist', 'success');
        });
        uiService.hideLoader();
      }
    });
  },

  async loadInitialData() {
    uiService.showLoader();
    try {
      // API integration happens here: load the catalog from the backend product listing route.
      const response = await apiService.get(API_CONFIG.endpoints.products.list);
      homeState.products = Array.isArray(response.products) ? response.products : [];
      homeState.categories = this.extractCategories(homeState.products);
      this.renderCategoryOptions();
      this.populateFilterInputs();
      this.applyFilters();
    } catch (error) {
      console.error(error);
      document.getElementById('productGrid').innerHTML = this.emptyState('Unable to load products from the backend.');
      uiService.showToast(error.message, 'error');
    } finally {
      uiService.hideLoader();
    }
  },

  extractCategories(products) {
    const map = new Map();
    products.forEach((product) => {
      if (product.categoryId?._id) {
        map.set(product.categoryId._id, product.categoryId.name || 'Category');
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  },

  renderCategoryOptions() {
    const select = document.getElementById('categoryFilter');
    if (!select) return;
    select.innerHTML = `<option value="all">All categories</option>${homeState.categories.map((category) => `<option value="${category.id}">${category.name}</option>`).join('')}`;
  },

  populateFilterInputs() {
    document.getElementById('searchInput').value = homeState.filters.search;
    document.getElementById('categoryFilter').value = homeState.filters.category;
    document.getElementById('sortFilter').value = homeState.filters.priceSort;
    document.getElementById('availabilityFilter').value = homeState.filters.availability;
  },

  applyFilters() {
    const search = homeState.filters.search.toLowerCase();
    let result = [...homeState.products].filter((product) => {
      const matchesSearch = !search || [product.name, product.description, product.categoryId?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search));
      const matchesCategory = homeState.filters.category === 'all' || product.categoryId?._id === homeState.filters.category;
      const matchesAvailability = homeState.filters.availability === 'all'
        || (homeState.filters.availability === 'inStock' && product.stock > 0)
        || (homeState.filters.availability === 'approved' && product.status === 'approved');

      return matchesSearch && matchesCategory && matchesAvailability;
    });

    if (homeState.filters.priceSort === 'low-high') result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    if (homeState.filters.priceSort === 'high-low') result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    if (homeState.filters.priceSort === 'top-rated') result.sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));

    homeState.filteredProducts = result;
    this.renderProducts();
    this.renderResultsSummary();
  },

  renderResultsSummary() {
    const total = homeState.filteredProducts.length;
    document.getElementById('resultsSummary').textContent = `${total} product${total === 1 ? '' : 's'} found`;
  },

  renderProducts() {
    const grid = document.getElementById('productGrid');
    const start = (homeState.page - 1) * homeState.pageSize;
    const paginated = homeState.filteredProducts.slice(start, start + homeState.pageSize);

    if (!paginated.length) {
      grid.innerHTML = this.emptyState('No products matched your filters. Try changing search or category.');
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    grid.innerHTML = paginated.map((product) => {
      const primaryImageId = product.images?.[0];
      const image = typeof primaryImageId === 'string' ? 'https://placehold.co/600x400?text=Product' : (primaryImageId?.url || 'https://placehold.co/600x400?text=Product');
      const effectivePrice = product.discountPrice || product.price;
      const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
      return `
        <div class="col-sm-6 col-xl-3">
          <div class="card product-card">
            <img src="${image}" alt="${product.name}" class="card-img-top">
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                <span class="badge badge-soft text-uppercase">${product.categoryId?.name || 'General'}</span>
                <span class="badge text-bg-${product.stock > 0 ? 'success' : 'secondary'}">${product.stock > 0 ? 'In stock' : 'Out of stock'}</span>
              </div>
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text text-muted small flex-grow-1">${(product.description || 'No description available.').slice(0, 85)}...</p>
              <div class="d-flex align-items-center gap-2 small text-muted mb-3">
                <i class="bi bi-star-fill text-warning"></i>
                <span>${Number(product.ratingAverage || 0).toFixed(1)}</span>
                <span>•</span>
                <span>${product.ratingCount || 0} ratings</span>
              </div>
              <div class="price-block mb-3">
                <span class="current-price">₹${Number(effectivePrice || 0).toFixed(2)}</span>
                ${hasDiscount ? `<span class="original-price ms-2">₹${Number(product.price).toFixed(2)}</span>` : ''}
              </div>
              <div class="d-grid gap-2 mt-auto">
                <a href="product-details.html?id=${product._id}" class="btn btn-dark">View details</a>
                <div class="d-flex gap-2">
                  <button class="btn btn-warning flex-fill" data-action="add-cart" data-product-id="${product._id}">Add to cart</button>
                  <button class="btn btn-outline-secondary" data-action="add-wishlist" data-product-id="${product._id}" title="Add to wishlist">
                    <i class="bi bi-heart"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.renderPagination();
  },

  renderPagination() {
    const totalPages = Math.ceil(homeState.filteredProducts.length / homeState.pageSize);
    const pagination = document.getElementById('pagination');
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    pagination.innerHTML = Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => `
      <li class="page-item ${page === homeState.page ? 'active' : ''}">
        <button class="page-link" data-page="${page}">${page}</button>
      </li>
    `).join('');
  },

  syncUrl() {
    const params = new URLSearchParams();
    Object.entries(homeState.filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== 'default') params.set(key === 'priceSort' ? 'sort' : key, value);
      if (key === 'search' && value) params.set('search', value);
    });
    history.replaceState({}, '', `${window.location.pathname}${params.toString() ? `?${params}` : ''}`);
  },

  async handleProtectedAction(callback) {
    if (!authService.isAuthenticated()) {
      uiService.showToast('Please login first to continue', 'error');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
      return;
    }

    try {
      await callback();
    } catch (error) {
      if (error.status === 401) {
        try {
          await authService.refreshToken();
          await callback();
          return;
        } catch (refreshError) {
          authService.clearSession();
          window.location.href = 'login.html';
        }
      }
      uiService.showToast(error.message, 'error');
    }
  },

  emptyState(message) {
    return `<div class="col-12"><div class="card placeholder-card"><div class="empty-state"><i class="bi bi-bag-x display-5 text-muted"></i><p class="mt-3 mb-0 text-muted">${message}</p></div></div></div>`;
  }
};

document.addEventListener('DOMContentLoaded', () => homePage.init());
