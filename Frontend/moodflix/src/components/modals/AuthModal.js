import '../../styles/modals/auth-modal.css';

export default class AuthModal {
  constructor() {
    this.modal = null;
  }
  
  show() {
    // Buat modal container
    this.modal = document.createElement("div");
    this.modal.className = "modal-overlay";
    
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content auth-modal";
    
    modalContent.innerHTML = `
      <h2>Login Diperlukan</h2>
      <p>Untuk melihat detail film, Anda perlu login terlebih dahulu.</p>
      <div>
        <button id="goToLogin" class="primary-button login-button">Login</button>
        <button id="goToRegister" class="primary-button register-button">Register</button>
        <button id="closeAuthModal" class="secondary-button">Tutup</button>
      </div>
    `;
    
    this.modal.appendChild(modalContent);
    document.body.appendChild(this.modal);
    
    // Event handlers
    this.setupEventListeners(modalContent);
    
    return this.modal;
  }
  
  setupEventListeners(modalContent) {
    modalContent.querySelector("#goToLogin").addEventListener("click", () => {
      this.close();
      window.router.navigateToLogin();
    });
    
    modalContent.querySelector("#goToRegister").addEventListener("click", () => {
      this.close();
      window.router.navigateToRegister();
    });
    
    modalContent.querySelector("#closeAuthModal").addEventListener("click", () => {
      this.close();
    });
    
    // Close modal when clicking outside
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
  }
  
  close() {
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
  }
}