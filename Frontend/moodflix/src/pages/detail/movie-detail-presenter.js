
class MovieDetailPresenter {
    constructor() {
      this.apiBaseUrl = 'https://moodflix-api-capstone-production.up.railway.app'; // ← Ganti ke URL baru
    }
  
    async getMovieDetail(movieId) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/movie/${movieId}`, {
          headers: {
            'Authorization': `Bearer ${window.authToken}`,
            'Content-Type': 'application/json'
          }
        });
  
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required. Please login again.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Movie Detail Data:', data); // Debug log
        return data;
      } catch (error) {
        console.error('Error fetching movie detail:', error);
        throw error;
      }
    }
  
    async showMovieDetail(movieId) {
      try {
        // Show loading
        const loadingModal = window.MovieDetailPages.showLoadingModal();
        
        const movieData = await this.getMovieDetail(movieId);
        
        // Remove loading modal
        document.body.removeChild(loadingModal);
        
        // Show movie detail
        window.MovieDetailPages.showMovieDetailModal(movieData);
      } catch (error) {
        // Remove loading modal if exists
        const loadingModal = document.querySelector('.loading-modal');
        if (loadingModal) {
          document.body.removeChild(loadingModal);
        }
        
        alert('Gagal memuat detail film: ' + error.message);
      }
    }
  }
  
  // Make it globally available
  window.MovieDetailPresenter = new MovieDetailPresenter();