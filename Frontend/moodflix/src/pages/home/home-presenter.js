import HomeView from "./home-view.js";
import cheerfulIcon from "../../img/cheerful.png";
import emotionalIcon from "../../img/emotional.png";
import energeticIcon from "../../img/energetic.png";
import imageticIcon from "../../img/imagetic.png";
import insightfulIcon from "../../img/insightful.png";
import neutralIcon from "../../img/neutral.png";
import romanticIcon from "../../img/romantic.png";
import thrillingIcon from "../../img/thrilling.png";

// Import komponen modal
import AuthModal from "../../components/modals/AuthModal.js";
import MoodModal from "../../components/modals/MoodModal.js";
import RecommendationsModal from "../../components/modals/RecommendationsModal.js";

// Import CommentService
import CommentService from "../detail/comment-service.js";

class HomePresenter {
  constructor(container) {
    this.apiBaseUrl = "https://moodflix-api-capstone-production.up.railway.app";
    this.container = container;
    this.view = new HomeView();
  }

  // Method init yang diperlukan
  init() {
    // Render view ke container
    this.container.innerHTML = '';
    this.container.appendChild(this.view.render());
    
    // Setup event listeners
    this.setupEventListeners();
    
    setTimeout(() => {
      this.updateNavbar();
      
      if (window.router) {
        const isLoggedIn = window.router.isAuthenticated();
        this.view.updateCommentFormVisibility(isLoggedIn);
      }
      
      this.loadComments();
    }, 100);
  }
  
  // Method untuk setup event listeners
  setupEventListeners() {
    const findMovieBtn = this.container.querySelector('#findMovieBtn');
    if (findMovieBtn) {
      findMovieBtn.addEventListener('click', () => this.showMoodModal());
    }
    
    const goToLoginBtn = this.container.querySelector('#goToLoginFromComment');
    const goToRegisterBtn = this.container.querySelector('#goToRegisterFromComment');
    
    if (goToLoginBtn) {
      goToLoginBtn.addEventListener('click', () => {
        if (window.router) window.router.navigateToLogin();
      });
    }
    
    if (goToRegisterBtn) {
      goToRegisterBtn.addEventListener('click', () => {
        if (window.router) window.router.navigateToRegister();
      });
    }
    
    const hamburgerMenu = this.container.querySelector('.hamburger-menu');
    const menu = this.container.querySelector('.menu');
    
    if (hamburgerMenu && menu) {
      hamburgerMenu.addEventListener('click', () => {
        hamburgerMenu.classList.toggle('active');
        menu.classList.toggle('active');
      });
      
      const menuLinks = menu.querySelectorAll('a');
      menuLinks.forEach(link => {
        link.addEventListener('click', () => {
          hamburgerMenu.classList.remove('active');
          menu.classList.remove('active');
        });
      });
    }
    
    const leftArrow = this.container.querySelector('.testimonials .arrow.left');
    const rightArrow = this.container.querySelector('.testimonials .arrow.right');
    
    if (leftArrow && rightArrow) {
      leftArrow.addEventListener('click', () => this.navigateTestimonials('prev'));
      rightArrow.addEventListener('click', () => this.navigateTestimonials('next'));
    }
  }
  
  navigateTestimonials(direction) {
    const slider = this.container.querySelector('#testimonialSlider');
    if (!slider) return;
    
    const cards = slider.querySelectorAll('.testimonial-card');
    if (cards.length <= 2) return; 
    
    let visibleIndices = [];
    cards.forEach((card, index) => {
      if (card.style.display === 'block') {
        visibleIndices.push(index);
      }
    });
    
    cards.forEach(card => {
      card.style.display = 'none';
    });
    
    let newIndices = [];
    if (direction === 'next') {
      newIndices[0] = (visibleIndices[1] + 1) % cards.length;
      newIndices[1] = (newIndices[0] + 1) % cards.length;
    } else { 
      newIndices[0] = (visibleIndices[0] - 2 + cards.length) % cards.length;
      newIndices[1] = (visibleIndices[0] - 1 + cards.length) % cards.length;
    }
    
    newIndices.forEach(index => {
      cards[index].style.display = 'block';
    });
    
    console.log(`Navigasi ${direction}: menampilkan kartu ${newIndices[0]} dan ${newIndices[1]}`);
  }
  
  updateNavbar() {
    if (!window.router) {
      console.error('Router tidak tersedia');
      return;
    }
    
    const isLoggedIn = window.router.isAuthenticated();
    const navbar = this.container.querySelector('.navbar');
    
    if (!navbar) {
      console.error('Navbar tidak ditemukan');
      return;
    }
    
    const existingAuthButtons = navbar.querySelector('.auth-buttons');
    if (existingAuthButtons) {
      navbar.removeChild(existingAuthButtons);
    }
    
    const authButtons = document.createElement('div');
    authButtons.className = 'auth-buttons';
    
    if (isLoggedIn) {
      const user = window.router.getCurrentUser();
      const username = user ? user.username : 'User';
      
      authButtons.innerHTML = `
        <span class="user-greeting">Halo, ${username}</span>
        <button id="logoutBtn">Logout</button>
      `;
      
      navbar.appendChild(authButtons);
      
      const logoutBtn = authButtons.querySelector('#logoutBtn');
      if (logoutBtn) {
        console.log('Menambahkan event listener ke tombol logout');
        
        logoutBtn.addEventListener('click', () => {
          console.log('Tombol logout diklik');
          if (window.router) {
            console.log('Memanggil window.router.logout()');
            window.router.logout();
            
            this.view.updateCommentFormVisibility(false);
            
            this.updateNavbar();
          } else {
            console.error('window.router tidak tersedia saat logout');
          }
        });
      }
    } else {
      authButtons.innerHTML = `
        <div class="auth-buttons">
          <button id="loginBtn">Login</button>
          <button id="registerBtn">Register</button>
        </div>
      `;
      
      navbar.appendChild(authButtons);
      
      const loginBtn = authButtons.querySelector('#loginBtn');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          if (window.router) {
            window.router.navigateToLogin();
          }
        });
      }
      
      const registerBtn = authButtons.querySelector('#registerBtn');
      if (registerBtn) {
        registerBtn.addEventListener('click', () => {
          if (window.router) {
            window.router.navigateToRegister();
          }
        });
      }
    }
  }

  showAuthRequiredForDetailModal() {
    const authModal = new AuthModal();
    authModal.show();
  }

  async showMoodModal() {
    const moodModal = new MoodModal(this);
    await moodModal.show();
  }

  showRecommendationsModal(recommendations, selectedMood) {
    const recommendationsModal = new RecommendationsModal(this);
    recommendationsModal.show(recommendations, selectedMood);
  }

  getMoodIcons() {
    return {
      cheerful: cheerfulIcon,
      emotional: emotionalIcon,
      energetic: energeticIcon,
      imaginative: imageticIcon,
      insightful: insightfulIcon,
      neutral: neutralIcon,
      romantic: romanticIcon,
      thrilling: thrillingIcon,
    };
  }

  async fetchAvailableMoods() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/moods`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.moods || [];
    } catch (error) {
      console.error("Error fetching moods:", error);

      return [
        "Cheerful",
        "Emotional",
        "Energetic",
        "Imaginative",
        "Insightful",
        "Neutral",
        "Romantic",
        "Thrilling"
      ];
    }
  }

  async getMovieRecommendations(mood, topK = 5) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/recommend/advanced`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood: mood,
          top_k: topK,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting recommendations:", error);
      throw error;
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

isAuthenticated() {
  return window.router ? window.router.isAuthenticated() : false;
}

  async loadComments() {
    try {
      if (!window.CommentService) {
        console.error("CommentService tidak tersedia");
        window.CommentService = new CommentService();
      }
      
      const latestCommentsData = await window.CommentService.getLatestComments(5);
      const latestComments = latestCommentsData.comments || [];
      
      console.log("Komentar terbaru untuk Apa Kata Mereka berhasil dimuat:", latestComments.length);

      this.view.renderTestimonials(latestComments);
      
      const allCommentsData = await window.CommentService.getAllComments();
      const allComments = allCommentsData.comments || [];
      
      const sortedAllComments = allComments.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      console.log("Semua komentar untuk Komentar Terbaru berhasil dimuat:", sortedAllComments.length);
      
      this.view.renderRecentComments(sortedAllComments);
      
      this.setupCommentForm();
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  }
  
  setupCommentForm() {
    const commentForm = this.container.querySelector("#commentForm");
    if (!commentForm) return;
    
    commentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      if (!window.router || !window.router.isAuthenticated()) {
        this.view.showStatus("Anda harus login untuk mengirim komentar", "error");
        return;
      }
      
      const commentText = commentForm.querySelector("#commentText").value.trim();
      if (!commentText) {
        this.view.showStatus("Komentar tidak boleh kosong", "error");
        return;
      }
      
      try {
        this.view.setCommentSubmitLoading(true);
        
        await window.CommentService.addGeneralComment(commentText);
        
        this.view.resetCommentForm();
        this.view.showStatus("Komentar berhasil dikirim", "success");
        
        this.loadComments();
      } catch (error) {
        console.error("Error submitting comment:", error);
        this.view.showStatus("Gagal mengirim komentar: " + error.message, "error");
      } finally {
        this.view.setCommentSubmitLoading(false);
      }
    });
  }
}

export default HomePresenter;