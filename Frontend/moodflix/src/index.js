import './pages/detail/comment-service.js';
import './pages/detail/movie-detail-pages.js';
import HomePresenter from './pages/home/home-presenter.js';
import Router from './routes/router';
import './styles/main.css';
import './styles/modals/movie-detail-modal.css';

const savedToken = localStorage.getItem("authToken");
const savedUser = localStorage.getItem("currentUser");
if (savedToken && savedUser) {
  window.authToken = savedToken;
  try {
    window.currentUser = JSON.parse(savedUser);
  } catch {
    window.currentUser = null;
  }
} else {
  window.authToken = null;
  window.currentUser = null;
}

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  window.router = new Router();

  if (!app.hasChildNodes()) {
    const presenter = new HomePresenter(app);
    presenter.init();
  }
});