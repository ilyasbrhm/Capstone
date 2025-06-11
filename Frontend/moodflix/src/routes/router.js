import LoginPresenter from '../pages/auth/login/login-presenter.js';
import RegisterPresenter from '../pages/auth/register/register-presenter.js';
import HomePresenter from '../pages/home/home-presenter.js';

export default class Router {
  constructor() {
    this.container = document.getElementById('app');
    this.currentPresenter = null;
    
    // Initialize router
    this.init();
  }

  init() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });

    // Handle initial load
    this.handleRoute();
  }

  handleRoute() {
    const path = window.location.hash.slice(1) || '/';
    
    switch (path) {
      case '/':
      case '/home':
        this.navigateToHome();
        break;
      case '/login':
        this.navigateToLogin();
        break;
      case '/register':
        this.navigateToRegister();
        break;
      default:
        this.navigateToHome();
    }
  }

  navigateToHome() {
    this.setRoute('/home');
    if (this.currentPresenter instanceof HomePresenter) return;
    
    this.currentPresenter = new HomePresenter(this.container);
    this.currentPresenter.init();
  }

  navigateToLogin() {
    this.setRoute('/login');
    this.currentPresenter = new LoginPresenter(this.container, this);
    this.currentPresenter.init();
  }

  navigateToRegister() {
    this.setRoute('/register');
    this.currentPresenter = new RegisterPresenter(this.container, this);
    this.currentPresenter.init();
  }

  setRoute(path) {
    if (window.location.hash !== `#${path}`) {
      window.history.pushState({}, '', `#${path}`);
    }
  }

  // Utility method to check if user is authenticated
  isAuthenticated() {
    return !!window.authToken;
  }

  // Method to get current user
  getCurrentUser() {
    return window.currentUser || null;
  }

  // Method to logout user
  logout() {
    window.authToken = null;
    window.currentUser = null;
    
    // Hapus data dari localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    
    // Navigasi ke home dan perbarui UI
    this.navigateToHome();
  }

  // Method to show movie detail
  async showMovieDetail(movieId) {
    if (!this.isAuthenticated()) {
      alert('Anda perlu login untuk melihat detail film.');
      this.navigateToLogin();
      return;
    }

    if (window.MovieDetailService) {
      await window.MovieDetailService.showMovieDetail(movieId);
    } else {
      alert('Service detail film belum tersedia.');
    }
  }

  navigateToComments() {
    window.location.hash = '#coment';
  }

  navigateToMovieDetail(id, title) {
    window.location.hash = `#movie/${id}`;
  }
}