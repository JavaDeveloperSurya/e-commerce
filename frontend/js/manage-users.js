document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('app').innerHTML = uiService.dashboardShell('<div id="manageUsersPage"></div>');
  uiService.initLayout({ withSidebar: true });
  const mount = document.getElementById('manageUsersPage');
  try {
    const users = await uiService.guardedRequest(() => storefrontModules.loadAdminUsers(), { requireRoles: ['admin'] });
    mount.innerHTML = uiService.pageHeader({ title: 'Manage Users', subtitle: 'Review user roles, profile states, and blocking status.' }) + `
      <div class="card placeholder-card"><div class="table-responsive"><table class="table align-middle mb-0">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Blocked</th><th>Profile</th></tr></thead>
        <tbody>${users.map((user) => `<tr><td>${user.name || '—'}</td><td>${user.email}</td><td class="text-capitalize">${user.role}</td><td>${user.isBlocked ? '<span class="badge text-bg-danger">Blocked</span>' : '<span class="badge text-bg-success">Active</span>'}</td><td>${user.isProfileCompleted ? 'Complete' : 'Pending'}</td></tr>`).join('')}</tbody>
      </table></div></div>`;
  } catch (error) {
    mount.innerHTML = uiService.emptyState(error.message || 'Unable to load users.', 'bi-exclamation-circle');
  }
});
