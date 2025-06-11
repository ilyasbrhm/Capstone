import RegisterPage from './register-page.js';

class RegisterPresenter {
  constructor(container, router) {
    this.container = container;
    this.router = router;
    this.view = new RegisterPage();
    this.apiBaseUrl = 'https://moodflix-api-capstone-production.up.railway.app';
    this.modalOverlay = null;
  }

  init() {
    // Buat overlay modal seperti di LoginPresenter
    this.modalOverlay = document.createElement('div');
    Object.assign(this.modalOverlay.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // transparan
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    });

    const viewElement = this.view.render();
    this.modalOverlay.appendChild(viewElement);
    this.container.appendChild(this.modalOverlay);

    this.setupEventListeners();

    // Event tutup modal klik overlay
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) {
        this.closeModal();
      }
    });

    // Event tombol close (jika ada di view)
    const closeBtn = this.modalOverlay.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeModal();
      });
    }
  }

  closeModal() {
    if (this.modalOverlay) {
      this.container.removeChild(this.modalOverlay);
      this.modalOverlay = null;
      this.router.navigateToHome();
    }
  }

  // ... (setupEventListeners dan fungsi lain tetap sama, tapi gunakan this.modalOverlay sebagai container)
  setupEventListeners() {
    const form = this.modalOverlay.querySelector('#registerForm');
    const goToLoginLink = this.modalOverlay.querySelector('#goToLogin');
    const passwordInput = this.modalOverlay.querySelector('#password');
    const confirmPasswordInput = this.modalOverlay.querySelector('#confirmPassword');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });

    goToLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeModal();
      this.router.navigateToLogin();
    });

    confirmPasswordInput.addEventListener('input', () => {
      this.validatePasswordMatch();
    });

    passwordInput.addEventListener('input', () => {
      this.validatePasswordMatch();
    });
  }

  // ...fungsi lain tetap sama, ganti this.container ke this.modalOverlay di dalam fungsi
  validatePasswordMatch() {
    const passwordInput = this.modalOverlay.querySelector('#password');
    const confirmPasswordInput = this.modalOverlay.querySelector('#confirmPassword');

    if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
      confirmPasswordInput.classList.add('error');
    } else {
      confirmPasswordInput.classList.remove('error');
    }
  }

  validateForm() {
    const form = this.modalOverlay.querySelector('#registerForm');
    const formData = new FormData(form);

    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (!name) {
      this.showMessage('Nama tidak boleh kosong', 'error');
      return false;
    }

    if (!email) {
      this.showMessage('Email tidak boleh kosong', 'error');
      return false;
    }

    if (password.length < 6) {
      this.showMessage('Password minimal 6 karakter', 'error');
      return false;
    }

    if (password !== confirmPassword) {
      this.showMessage('Password dan konfirmasi password tidak cocok', 'error');
      return false;
    }

    return true;
  }

  async handleRegister() {
  if (!this.validateForm()) {
    return;
  }

  const form = this.modalOverlay.querySelector('#registerForm');
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  const formData = new FormData(form);
  const data = {
    username: formData.get('name').trim(),
    email: formData.get('email').trim(),
    password: formData.get('password'),
  };

  console.log('Data yang dikirim:', data);

  try {
    const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    console.log('Response dari server:', result);

    if (response.ok) {
      this.showMessage('Registrasi berhasil! Silakan login.', 'success');
      setTimeout(() => {
        this.closeModal();
        this.router.navigateToLogin();
      }, 1500);
    } else {
      this.showMessage(result.message || 'Registrasi gagal. Silakan coba lagi.', 'error');
    }
  } catch (error) {
    console.error('Kesalahan fetch:', error);
    this.showMessage('Terjadi kesalahan jaringan. Silakan coba lagi.', 'error');
  } finally {
    submitButton.disabled = false;
  }
}

  showMessage(message, type) {
    const messageDiv = this.modalOverlay.querySelector('#registerMessage');
    if (!messageDiv) return;
    messageDiv.textContent = message;
    messageDiv.className = 'message ' + (type === 'success' ? 'success' : 'error');
    messageDiv.style.display = 'block';
  }
}

export default RegisterPresenter;
