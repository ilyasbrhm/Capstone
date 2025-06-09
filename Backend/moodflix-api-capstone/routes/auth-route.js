const {
    register,
    login,
    getCurrentUser
  } = require('../services/auth-service');
  
  module.exports = [
    // Registrasi pengguna baru
    {
      method: 'POST',
      path: '/auth/register',
      handler: register,
      options: {
        auth: false
      }
    },
    
    // Login pengguna
    {
      method: 'POST',
      path: '/auth/login',
      handler: login,
      options: {
        auth: false
      }
    },
    
    // Get current user (memerlukan autentikasi)
    {
      method: 'GET',
      path: '/auth/user',
      handler: getCurrentUser
    }
  ];