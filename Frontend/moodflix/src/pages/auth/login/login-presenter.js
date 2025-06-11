import LoginPage from "./login-page.js";

class LoginPresenter {
  constructor(container, router) {
    this.container = container;
    this.router = router;
    this.view = new LoginPage();
    this.apiBaseUrl = "https://moodflix-api-capstone-production.up.railway.app";
    this.modalOverlay = null;
  }

  init() {
    // Buat overlay modal
    this.modalOverlay = document.createElement("div");
    Object.assign(this.modalOverlay.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    });

    // Render login form dan masukkan ke overlay
    const viewElement = this.view.render();
    this.modalOverlay.appendChild(viewElement);
    this.container.appendChild(this.modalOverlay);

    // Event listener
    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = this.modalOverlay.querySelector("#loginForm");
    const goToRegisterLink = this.modalOverlay.querySelector("#goToRegister");
    const closeBtn = this.modalOverlay.querySelector("#closeLoginModal");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    goToRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.closeModal();
      this.router.navigateToRegister();
    });

    closeBtn.addEventListener("click", () => {
      this.closeModal();
    });

    this.modalOverlay.addEventListener("click", (e) => {
      if (e.target === this.modalOverlay) {
        this.closeModal();
      }
    });
  }

  async handleLogin() {
    const form = this.modalOverlay.querySelector("#loginForm");
    const submitButton = form.querySelector('button[type="submit"]');
    const messageDiv = this.modalOverlay.querySelector("#loginMessage");

    const formData = new FormData(form);
    const loginData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    submitButton.textContent = "Loading...";
    submitButton.disabled = true;
    this.hideMessage();

    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (response.ok) {
        this.showMessage("Login berhasil! Mengalihkan...", "success");
        window.authToken = result.token;
        window.currentUser = result.user;

        // Simpan ke localStorage
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("currentUser", JSON.stringify(result.user));

        setTimeout(() => {
          this.closeModal();
          this.router.navigateToHome();
        }, 1500);
      } else {
        this.showMessage(
          result.message || "Login gagal. Periksa email dan password Anda.",
          "error"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      this.showMessage(
        "Terjadi kesalahan. Pastikan server API berjalan.",
        "error"
      );
    } finally {
      submitButton.textContent = "Login";
      submitButton.disabled = false;
    }
  }

  showMessage(text, type) {
    const messageDiv = this.modalOverlay.querySelector("#loginMessage");
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = "block";
  }

  hideMessage() {
    const messageDiv = this.modalOverlay.querySelector("#loginMessage");
    messageDiv.style.display = "none";
  }

  closeModal() {
    if (this.modalOverlay) {
      this.container.removeChild(this.modalOverlay);
      this.modalOverlay = null;
    }
  }
}

export default LoginPresenter;
