// auth.js - Global authentication utilities
const Auth = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Get current user data
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Redirect if not authenticated
  requireAuth: (redirectUrl = 'login.html') => {
    if (!Auth.isAuthenticated()) {
      window.location.href = redirectUrl + '?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }
    return true;
  },

  // Role-based access (optional)
  hasRole: (role) => {
    const user = Auth.getUser();
    return user?.role === role;
  },

  // Logout function
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }
};

// Attach to window for global access
window.Auth = Auth;