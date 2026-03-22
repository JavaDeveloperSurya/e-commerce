document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('app').innerHTML = uiService.dashboardShell('<div id="addProductPage"></div>');
  uiService.initLayout({ withSidebar: true });
  const mount = document.getElementById('addProductPage');
  mount.innerHTML = uiService.pageHeader({ title: 'Add Product', subtitle: 'Create a product and submit it for admin approval.' }) + `
    <div class="card placeholder-card"><div class="card-body p-4">
      <form id="addProductForm" class="row g-3">
        <div class="col-md-6"><label class="form-label">Product name</label><input class="form-control" name="name" required></div>
        <div class="col-md-3"><label class="form-label">Price</label><input class="form-control" name="price" type="number" required></div>
        <div class="col-md-3"><label class="form-label">Stock</label><input class="form-control" name="stock" type="number" required></div>
        <div class="col-md-6"><label class="form-label">Category ID</label><input class="form-control" name="categoryId" placeholder="Paste valid MongoDB category id"></div>
        <div class="col-md-6"><label class="form-label">Discount price</label><input class="form-control" name="discountPrice" type="number"></div>
        <div class="col-12"><label class="form-label">Description</label><textarea class="form-control" name="description" rows="4"></textarea></div>
        <div class="col-12"><label class="form-label">Images</label><input class="form-control" type="file" name="images" multiple></div>
        <div class="col-12"><button class="btn btn-dark">Submit Product</button></div>
      </form>
    </div></div>`;

  document.getElementById('addProductForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    await uiService.guardedRequest(() => apiService.post(API_CONFIG.endpoints.products.create, form), { requireRoles: ['seller'] });
    uiService.showToast('Product submitted successfully', 'success');
    setTimeout(() => window.location.href = 'my-products.html', 800);
  });
});
