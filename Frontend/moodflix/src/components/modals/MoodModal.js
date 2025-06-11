import '../../styles/modals/mood-modal.css';

export default class MoodModal {
  constructor(presenter) {
    this.presenter = presenter;
    this.modal = null;
    this.selectedMood = null;
  }
  
  async show() {
    // Buat modal container
    this.modal = document.createElement("div");
    this.modal.className = "modal-overlay";
    
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content mood-modal";
    
    modalContent.innerHTML = `
      <button id="closeModal" class="modal-close-btn">×</button>
      <h2>Pilih Mood Anda</h2>
      <p>Sedang memuat mood yang tersedia...</p>
      <div id="moodOptions" class="mood-options"></div>
      <div>
        <label for="topKSelect" style="display: block; margin-bottom: 10px; color: #000957;">Jumlah Rekomendasi:</label>
        <select id="topKSelect" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 20px;">
          <option value="1">1 Film</option>
          <option value="2">2 Film</option>
          <option value="3">3 Film</option>
          <option value="4">4 Film</option>
          <option value="5" selected>5 Film</option>
        </select>
      </div>
      <div>
        <button id="getMoodRecommendations" class="primary-button" disabled>Dapatkan Rekomendasi</button>
      </div>
    `;
    
    this.modal.appendChild(modalContent);
    document.body.appendChild(this.modal);
    
    // Setup event listeners
    this.setupEventListeners(modalContent);
    
    // Load moods
    await this.loadMoods(modalContent);
    
    return this.modal;
  }
  
  setupEventListeners(modalContent) {
    const closeModalBtn = modalContent.querySelector("#closeModal");
    closeModalBtn.addEventListener("click", () => this.close());
    
    const recommendBtn = modalContent.querySelector("#getMoodRecommendations");
    recommendBtn.addEventListener("click", async () => {
      if (!this.selectedMood) return;
      
      const topKSelect = modalContent.querySelector("#topKSelect");
      const topK = parseInt(topKSelect.value, 10);
      
      // Update UI to loading state
      recommendBtn.textContent = "Memuat...";
      recommendBtn.disabled = true;
      
      try {
        const recommendations = await this.presenter.getMovieRecommendations(
          this.selectedMood,
          topK
        );
        
        // Close this modal
        this.close();
        
        // Show recommendations modal
        this.presenter.showRecommendationsModal(recommendations, this.selectedMood);
      } catch (error) {
        console.error("Error getting recommendations:", error);
        
        // Show error message
        modalContent.querySelector("p").textContent = 
          "Gagal mendapatkan rekomendasi. Silakan coba lagi nanti.";
        modalContent.querySelector("p").style.color = "#dc3545";
        
        // Reset button
        recommendBtn.textContent = "Dapatkan Rekomendasi";
        recommendBtn.disabled = false;
      }
    });
    
    // Close modal when clicking outside
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
  }
  
  async loadMoods(modalContent) {
    try {
      const moods = await this.presenter.fetchAvailableMoods();
      const moodOptionsContainer = modalContent.querySelector("#moodOptions");
      
      const loadingText = modalContent.querySelector("p");
      loadingText.textContent = "Pilih mood yang sesuai dengan perasaan Anda saat ini:";
      
      // Mapping mood ke ikon PNG
      const moodIcons = this.presenter.getMoodIcons();
      
      // Buat tombol-tombol mood
      moods.forEach((mood) => {
        const iconSrc = moodIcons[mood.toLowerCase()];
        if (!iconSrc) return;
        
        const moodButton = document.createElement("button");
        moodButton.className = "mood-button";
        moodButton.dataset.mood = mood;
        
        moodButton.innerHTML = `
          <div class="mood-button-content">
            <img src="${iconSrc}" alt="${mood}" />
            <span>${this.presenter.capitalizeFirstLetter(mood)}</span>
          </div>
        `;
        
        // Tambahkan event listeners
        moodButton.addEventListener("mouseenter", () => {
          if (this.selectedMood !== mood) {
            moodButton.style.background = "#e0f0ff";
            moodButton.style.borderColor = "#007bff";
          }
        });
        
        moodButton.addEventListener("mouseleave", () => {
          if (this.selectedMood !== mood) {
            moodButton.style.background = "#fff";
            moodButton.style.borderColor = "#ddd";
          }
        });
        
        // Tambahkan event click
        moodButton.addEventListener("click", () => {
          // Deselect semua
          moodOptionsContainer.querySelectorAll(".mood-button").forEach((btn) => {
            btn.style.background = "#fff";
            btn.style.borderColor = "#ddd";
          });
          
          // Select yang ini
          moodButton.style.background = "#9EC6F3";
          moodButton.style.borderColor = "#0069d9";
          
          this.selectedMood = mood;
          
          // Aktifkan tombol rekomendasi
          modalContent.querySelector("#getMoodRecommendations").disabled = false;
        });
        
        moodOptionsContainer.appendChild(moodButton);
      });
    } catch (error) {
      console.error("Error loading moods:", error);
      modalContent.querySelector("p").textContent = 
        "Gagal memuat mood. Silakan coba lagi nanti.";
    }
  }
  
  close() {
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
  }
}