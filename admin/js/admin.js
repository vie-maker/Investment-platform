document.addEventListener('DOMContentLoaded', function() {
  // Initialize all admin functionality
  initSidebar();
  initUserManagement();
  initPaymentProcessing();
  initWithdrawalProcessing();
  initDashboardCharts();
});

// Sidebar functionality
function initSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  const menuItems = document.querySelectorAll('.admin-menu-item');
  
  // Highlight active menu item
  const currentPage = window.location.pathname.split('/').pop();
  menuItems.forEach(item => {
    const link = item.getAttribute('href').split('/').pop();
    if (link === currentPage) {
      item.classList.add('active');
    }
    
    item.addEventListener('click', function(e) {
      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

// User management
function initUserManagement() {
  const userTable = document.getElementById('usersTable');
  
  if (userTable) {
    // Load users on page load
    loadUsers();
    
    // Search functionality
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchUsers');
    
    searchButton.addEventListener('click', function() {
      loadUsers(searchInput.value);
    });
    
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        loadUsers(searchInput.value);
      }
    });
  }
}

// Load users from API
async function loadUsers(searchTerm = '') {
  try {
    const response = await fetch(`/api/v1/users?search=${searchTerm}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      renderUsersTable(data.data.users);
    } else {
      throw new Error(data.message || 'Failed to load users');
    }
  } catch (error) {
    console.error('Error loading users:', error);
    alert('Failed to load users: ' + error.message);
  }
}

// Render users table
function renderUsersTable(users) {
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '';
  
  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>#${user._id.substring(18)}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="user-avatar">${user.username.substring(0, 2).toUpperCase()}</div>
          <span>${user.username}</span>
        </div>
      </td>
      <td>${user.email}</td>
      <td>${user.country || 'N/A'}</td>
      <td>$${user.balance.toFixed(2)}</td>
      <td><span class="status-badge status-${user.status}">${user.status}</span></td>
      <td>${new Date(user.createdAt).toLocaleDateString()}</td>
      <td>
        <button class="btn-admin btn-admin-primary btn-sm" onclick="viewUser('${user._id}')">View</button>
        <button class="btn-admin ${user.status === 'active' ? 'btn-admin-danger' : 'btn-admin-success'} btn-sm" 
          onclick="${user.status === 'active' ? 'blockUser' : 'activateUser'}('${user._id}')">
          ${user.status === 'active' ? 'Block' : 'Activate'}
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Payment processing
function initPaymentProcessing() {
  const paymentModal = document.getElementById('paymentModal');
  
  if (paymentModal) {
    // Open modal
    document.getElementById('processPaymentBtn').addEventListener('click', function() {
      paymentModal.style.display = 'flex';
      loadUserSelect('paymentUser');
    });
    
    // Close modal
    document.getElementById('closePaymentModal').addEventListener('click', function() {
      paymentModal.style.display = 'none';
    });
    
    document.getElementById('cancelPayment').addEventListener('click', function() {
      paymentModal.style.display = 'none';
    });
    
    // Form submission
    document.getElementById('paymentForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      await processPayment();
    });
  }
}

// Withdrawal processing
function initWithdrawalProcessing() {
  const withdrawalModal = document.getElementById('withdrawalModal');
  
  if (withdrawalModal) {
    // Open modal
    document.getElementById('processWithdrawalBtn').addEventListener('click', function() {
      withdrawalModal.style.display = 'flex';
      loadUserSelect('withdrawalUser');
    });
    
    // Close modal
    document.getElementById('closeWithdrawalModal').addEventListener('click', function() {
      withdrawalModal.style.display = 'none';
    });
    
    document.getElementById('cancelWithdrawal').addEventListener('click', function() {
      withdrawalModal.style.display = 'none';
    });
    
    // Form submission
    document.getElementById('withdrawalForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      await processWithdrawal();
    });
  }
}

// Dashboard charts
function initDashboardCharts() {
  if (document.getElementById('dashboardChart')) {
    // Initialize charts using Chart.js
    const ctx = document.getElementById('dashboardChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Total Deposits',
          data: [12000, 19000, 3000, 5000, 2000, 30000],
          backgroundColor: 'rgba(108, 92, 231, 0.2)',
          borderColor: 'rgba(108, 92, 231, 1)',
          borderWidth: 2
        }, {
          label: 'Total Withdrawals',
          data: [8000, 12000, 2500, 3000, 1500, 18000],
          backgroundColor: 'rgba(0, 184, 148, 0.2)',
          borderColor: 'rgba(0, 184, 148, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

// Global functions
window.viewUser = async function(userId) {
  try {
    const response = await fetch(`/api/v1/users/${userId}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      const user = data.data.user;
      const userModal = document.getElementById('userModal');
      const content = document.getElementById('userDetailsContent');
      
      content.innerHTML = `
        <div class="user-details">
          <div class="detail-row">
            <span class="detail-label">Username:</span>
            <span class="detail-value">${user.username}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${user.email}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Balance:</span>
            <span class="detail-value">$${user.balance.toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-badge status-${user.status}">${user.status}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Country:</span>
            <span class="detail-value">${user.country || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">PayPal Email:</span>
            <span class="detail-value">${user.paypalEmail || 'Not set'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Joined:</span>
            <span class="detail-value">${new Date(user.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div class="form-actions" style="margin-top: 20px;">
          <button class="btn-admin btn-admin-primary" onclick="editUser('${user._id}')">Edit</button>
          <button class="btn-admin btn-admin-danger" onclick="deleteUser('${user._id}')">Delete</button>
        </div>
      `;
      
      userModal.style.display = 'flex';
    } else {
      throw new Error(data.message || 'Failed to load user details');
    }
  } catch (error) {
    console.error('Error viewing user:', error);
    alert('Failed to load user details: ' + error.message);
  }
};

window.editUser = function(userId) {
  alert('Edit user functionality coming soon for user: ' + userId);
  // Implementation would open an edit modal with user details
};

window.deleteUser = async function(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        alert('User deleted successfully');
        loadUsers();
        document.getElementById('userModal').style.display = 'none';
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    }
  }
};

window.blockUser = async function(userId) {
  if (confirm('Are you sure you want to block this user?')) {
    try {
      const response = await fetch(`/api/v1/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'inactive' })
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        alert('User blocked successfully');
        loadUsers();
      } else {
        throw new Error(data.message || 'Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user: ' + error.message);
    }
  }
};

window.activateUser = async function(userId) {
  try {
    const response = await fetch(`/api/v1/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'active' })
    });
    const data = await response.json();
    
    if (data.status === 'success') {
      alert('User activated successfully');
      loadUsers();
    } else {
      throw new Error(data.message || 'Failed to activate user');
    }
  } catch (error) {
    console.error('Error activating user:', error);
    alert('Failed to activate user: ' + error.message);
  }
};

// Helper functions
async function loadUserSelect(selectId) {
  try {
    const response = await fetch('/api/v1/users');
    const data = await response.json();
    
    if (data.status === 'success') {
      const select = document.getElementById(selectId);
      select.innerHTML = '<option value="">Select User</option>';
      
      data.data.users.forEach(user => {
        const option = document.createElement('option');
        option.value = user._id;
        option.textContent = `${user.username} (${user.email}) - $${user.balance.toFixed(2)}`;
        select.appendChild(option);
      });
    } else {
      throw new Error(data.message || 'Failed to load users');
    }
  } catch (error) {
    console.error('Error loading user select:', error);
  }
}

async function processPayment() {
  const userId = document.getElementById('paymentUser').value;
  const amount = document.getElementById('paymentAmount').value;
  const method = document.getElementById('paymentMethod').value;
  
  if (!userId || !amount) {
    alert('Please select a user and enter an amount');
    return;
  }
  
  try {
    const response = await fetch('/api/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, amount, method })
    });
    const data = await response.json();
    
    if (data.status === 'success') {
      if (method === 'paypal' && data.data.approvalUrl) {
        window.location.href = data.data.approvalUrl;
      } else {
        alert('Payment processed successfully!');
        document.getElementById('paymentModal').style.display = 'none';
        document.getElementById('paymentForm').reset();
        loadUsers();
      }
    } else {
      throw new Error(data.message || 'Payment failed');
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed: ' + error.message);
  }
}

async function processWithdrawal() {
  const userId = document.getElementById('withdrawalUser').value;
  const email = document.getElementById('withdrawalEmail').value;
  const amount = document.getElementById('withdrawalAmount').value;
  
  if (!userId || !email || !amount) {
    alert('Please fill all fields');
    return;
  }
  
  try {
    const response = await fetch('/api/v1/withdrawals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, amount, paypalEmail: email })
    });
    const data = await response.json();
    
    if (data.status === 'success') {
      alert(`Withdrawal processed! Batch ID: ${data.data.batchId}`);
      document.getElementById('withdrawalModal').style.display = 'none';
      document.getElementById('withdrawalForm').reset();
      loadUsers();
    } else {
      throw new Error(data.message || 'Withdrawal failed');
    }
  } catch (error) {
    console.error('Withdrawal error:', error);
    alert('Withdrawal failed: ' + error.message);
  }
}