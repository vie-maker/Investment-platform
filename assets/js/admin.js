// Admin Dashboard Functionality
document.addEventListener('DOMContentLoaded', () => {
  // Toggle mobile menu
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const adminSidebar = document.querySelector('.admin-sidebar');
  
  if (mobileMenuBtn && adminSidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      adminSidebar.classList.toggle('collapsed');
    });
  }
  
  // Logout functionality
  const logoutBtn = document.querySelector('.admin-menu-item[href="../../index.html"]');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('authToken');
      window.location.href = '../../index.html';
    });
  }
  
  // Table row actions
  document.querySelectorAll('.btn-admin-primary').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const userId = row.querySelector('td:first-child').textContent;
      alert(`Viewing details for user ${userId}`);
    });
  });
  
  document.querySelectorAll('.btn-admin-danger').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const userId = row.querySelector('td:first-child').textContent;
      if (confirm(`Are you sure you want to block user ${userId}?`)) {
        row.style.opacity = '0.5';
        alert(`User ${userId} has been blocked`);
      }
    });
  });
  
  document.querySelectorAll('.btn-admin-success').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const statusBadge = row.querySelector('.status-badge');
      statusBadge.className = 'status-badge status-active';
      statusBadge.textContent = 'Active';
      alert('User has been activated');
    });
  });
  
  // Search functionality
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const rows = document.querySelectorAll('.admin-table tbody tr');
      
      rows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        if (rowText.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
  
  // Pagination
  const paginationButtons = document.querySelectorAll('.pagination button');
  if (paginationButtons) {
    paginationButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
          document.querySelector('.pagination button.active').classList.remove('active');
          this.classList.add('active');
          // In a real app, you would fetch the new page data
        }
      });
    });
  }
  
  // Load admin data
  if (window.location.pathname.includes('admin')) {
    loadAdminData();
  }
});

async function loadAdminData() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '../../login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    // Fetch admin data based on current page
    if (window.location.pathname.includes('dashboard.html')) {
      const [usersRes, investmentsRes, transactionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_BASE_URL}/admin/investments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_BASE_URL}/admin/transactions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);
      
      // Process and display data
      // In a real app, you would update the UI with the fetched data
    }
    
  } catch (error) {
    console.error('Error loading admin data:', error);
    alert('Failed to load admin data. Please try again.');
  }
}