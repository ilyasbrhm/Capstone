import Router from './routes/router.js';
import './pages/detail/movie-detail-pages.js'; 
import './pages/detail/movie-detail-presenter.js'; 
import './pages/detail/comment-service.js'; 
import './styles/response.css'; 

document.addEventListener('DOMContentLoaded', () => {
 
  const router = new Router();
  
  window.router = router;
  
  console.log('Moodflix App initialized');
});