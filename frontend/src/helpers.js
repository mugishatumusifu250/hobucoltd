export const getAvatarColor = (name) => {
  if (!name || name.length === 0) return 'avatar-default';
  return 'avatar-' + name.charAt(0).toLowerCase();
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString();
};

export const initDashboardScripts = () => {
  // Sidebar toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');

  const closeSidebar = () => {
    if (sidebar) sidebar.classList.remove('show');
    if (mobileOverlay) mobileOverlay.classList.remove('show');
    document.body.style.overflow = '';
  };

  const toggleSidebar = () => {
    if (sidebar) sidebar.classList.toggle('show');
    if (mobileOverlay) mobileOverlay.classList.toggle('show');
    document.body.style.overflow = sidebar?.classList.contains('show') ? 'hidden' : '';
  };

  if (mobileMenuToggle) {
    const handler = mobileMenuToggle.onclick;
    mobileMenuToggle.onclick = null;
    mobileMenuToggle.addEventListener('click', toggleSidebar);
  }
  if (sidebarToggle) {
    sidebarToggle.onclick = null;
    sidebarToggle.addEventListener('click', closeSidebar);
  }
  if (mobileOverlay) {
    mobileOverlay.onclick = null;
    mobileOverlay.addEventListener('click', closeSidebar);
  }

  // Window resize
  const resizeHandler = () => {
    if (window.innerWidth > 768) closeSidebar();
  };
  window.addEventListener('resize', resizeHandler);

  return () => {
    window.removeEventListener('resize', resizeHandler);
  };
};

export const initProfileDropdown = () => {
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');

  if (!profileBtn || !profileDropdown) return;

  const toggle = (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('show');
    profileBtn.classList.toggle('active');
  };

  profileBtn.onclick = null;
  profileBtn.addEventListener('click', toggle);

  const close = (e) => {
    if (profileDropdown && !profileDropdown.contains(e.target) && profileBtn !== e.target) {
      profileDropdown.classList.remove('show');
      profileBtn.classList.remove('active');
    }
  };
  document.addEventListener('click', close);

  return () => document.removeEventListener('click', close);
};

export const goBack = () => window.history.back();