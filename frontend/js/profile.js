document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('app').innerHTML = uiService.dashboardShell('<div id="profilePage"></div>');
  uiService.initLayout({ withSidebar: true });
  const mount = document.getElementById('profilePage');
  try {
    const user = await uiService.guardedRequest(() => storefrontModules.loadProfile(), { requireRoles: ['buyer', 'seller', 'admin'] });
    if (!user) return;
    const address = user.addresses?.[0] || {};
    mount.innerHTML = uiService.pageHeader({ title: 'Profile', subtitle: 'Update your personal details used across the storefront.' }) + `
      <div class="card placeholder-card"><div class="card-body p-4">
        <form id="profileForm" class="row g-3">
          <div class="col-md-6"><label class="form-label">Name</label><input class="form-control" name="name" value="${user.name || ''}"></div>
          <div class="col-md-6"><label class="form-label">Phone</label><input class="form-control" name="phone" value="${user.phone || ''}"></div>
          <div class="col-12"><label class="form-label">Street</label><input class="form-control" name="street" value="${address.street || ''}"></div>
          <div class="col-md-4"><label class="form-label">City</label><input class="form-control" name="city" value="${address.city || ''}"></div>
          <div class="col-md-4"><label class="form-label">State</label><input class="form-control" name="state" value="${address.state || ''}"></div>
          <div class="col-md-4"><label class="form-label">Postal Code</label><input class="form-control" name="postalCode" value="${address.postalCode || ''}"></div>
          <div class="col-12"><button class="btn btn-dark">Save Profile</button></div>
        </form>
      </div></div>`;

    document.getElementById('profileForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      await uiService.guardedRequest(() => apiService.put(API_CONFIG.endpoints.profile.update, {
        name: formData.get('name'),
        phone: formData.get('phone'),
        addresses: [{
          label: 'Home',
          street: formData.get('street'),
          city: formData.get('city'),
          state: formData.get('state'),
          country: 'India',
          postalCode: formData.get('postalCode')
        }]
      }));
      uiService.showToast('Profile updated', 'success');
    });
  } catch (error) {
    mount.innerHTML = uiService.emptyState(error.message || 'Unable to load profile.', 'bi-exclamation-circle');
  }
});
