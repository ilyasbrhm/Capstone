import '../../styles/modals/recommendations-modal.css';

export default class RecommendationsModal {
  constructor(presenter) {
    this.presenter = presenter;
    this.modal = null;
    this.currentIndex = 0;
  }
  
  show(recommendations, selectedMood) {
    // Create modal container
    this.modal = document.createElement("div");
    this.modal.className = "modal-overlay";
    
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content recommendations-modal";
    
    // Create header
    const header = document.createElement("div");
    header.innerHTML = `
      <h2>Rekomendasi Film untuk Mood: ${this.presenter.capitalizeFirstLetter(selectedMood)}</h2>
      <p>Berikut adalah film yang cocok dengan mood Anda saat ini:</p>
    `;
    modalContent.appendChild(header);
    
    // Get movies from recommendations
    const movies = recommendations.movies || recommendations.recommendations || [];
    
    if (movies.length > 0) {
      // Create slider wrapper
      const sliderWrapper = document.createElement("div");
      sliderWrapper.className = "slider-wrapper";
      
      // Left arrow
      const leftNav = document.createElement("button");
      leftNav.innerHTML = "❮";
      leftNav.className = "slider-nav";
      
      // Right arrow
      const rightNav = document.createElement("button");
      rightNav.innerHTML = "❯";
      rightNav.className = "slider-nav";
      
      // Card container
      const cardContainer = document.createElement("div");
      cardContainer.id = "movieCardSlider";
      cardContainer.className = "movie-card-container";
      
      sliderWrapper.appendChild(leftNav);
      sliderWrapper.appendChild(cardContainer);
      sliderWrapper.appendChild(rightNav);
      
      modalContent.appendChild(sliderWrapper);
      
      // Setup navigation
      leftNav.addEventListener("click", () => {
        this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : movies.length - 1;
        this.renderMovieCard(cardContainer, movies, this.currentIndex);
      });
      
      rightNav.addEventListener("click", () => {
        this.currentIndex = this.currentIndex < movies.length - 1 ? this.currentIndex + 1 : 0;
        this.renderMovieCard(cardContainer, movies, this.currentIndex);
      });
      
      // Render first movie card
      this.renderMovieCard(cardContainer, movies, this.currentIndex);
    }
    
    // Add close button
    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.className = "modal-close-btn";
    closeButton.addEventListener("click", () => this.close());
    
    modalContent.appendChild(closeButton);
    this.modal.appendChild(modalContent);
    document.body.appendChild(this.modal);
    
    // Close modal when clicking outside
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
    
    return this.modal;
  }
  
  renderMovieCard(container, movies, index) {
    container.innerHTML = "";
    if (movies.length === 0) return;
    
    const movie = movies[index];
    const posterUrl = movie.poster_url ? movie.poster_url : "https://placehold.co/200x300?text=No+Poster";
    
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";
    
    movieCard.innerHTML = `
      <img src="${posterUrl}" alt="Poster">
      <div class="movie-card-content">
        <h3>${movie.title}</h3>
        <p>Tahun: ${movie.release_year || movie.release_date?.substring(0, 4) || "N/A"}</p>
        <p class="rating">Rating: ${movie.rating || movie.imdb_score || movie.imdb_rating || "N/A"}/10</p>
        <button id="detailBtn" class="detail-button">Detail</button>
      </div>
    `;
    
    // Handler tombol detail
    movieCard.querySelector("#detailBtn").addEventListener("click", async (e) => {
      e.stopPropagation();
      
      // Jika belum login, munculkan modal login
      if (!this.presenter.isAuthenticated()) {
        this.close();
        this.presenter.showAuthRequiredForDetailModal();
        return;
      }
      
      // Tampilkan loading modal
      const loadingModal = window.MovieDetailPages.showLoadingModal();
      
      try {
        // Ambil detail film dari backend
        const movieId = movie.movie_id || movie.id;
        if (!movieId) {
          alert("ID film tidak ditemukan!");
          return;
        }
        
        const response = await fetch(`${this.presenter.apiBaseUrl}/movie/${movieId}`, {
          headers: {
            Authorization: `Bearer ${window.authToken}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) throw new Error("Gagal memuat detail film");
        
        const movieData = await response.json();
        
        // Tutup loading
        document.body.removeChild(loadingModal);
        
        // Tutup modal rekomendasi dulu
        this.close();
        
        // Baru tampilkan modal detail
        window.MovieDetailPages.showMovieDetailModal(movieData);
      } catch (error) {
        document.body.removeChild(loadingModal);
        alert("Gagal memuat detail film: " + error.message);
      }
    });
    
    container.appendChild(movieCard);
  }
  
  close() {
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
  }
}