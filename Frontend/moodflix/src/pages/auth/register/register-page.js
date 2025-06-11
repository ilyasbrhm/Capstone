import '../../../styles/auth.css';
import MoodFlix from '../../../img/MoodFlix.png';


class RegisterPage {
  constructor() {
    this.root = document.createElement("div");
    this.root.className = "modal-overlay";
  }

  render() {
    this.root.innerHTML = `
      <div class="auth-container">
        <div class="auth-form">
          <button class="close-btn" title="Tutup">&times;</button>
          <img src="${MoodFlix}" alt="Moodflix"/>
          <h2>Create<br>Account</h2>
          <form id="registerForm">
            <div class="form-group">
              <input type="text" id="name" name="name" placeholder="Nama" required />
            </div>
            <div class="form-group">
              <input type="email" id="email" name="email" placeholder="Email" required />
            </div>
            <div class="form-group">
              <input type="password" id="password" name="password" placeholder="Password" required minlength="6" />
            </div>
            <div class="form-group">
              <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Konfirmasi Password" required minlength="6" />
            </div>
            <button type="submit">Sign In</button>
            <div class="form-links">
              <p>Have an account? <a href="#" id="goToLogin">Log in</a></p>
            </div>
          </form>
          <div id="registerMessage" class="message"></div>
          <div class="footer-text">Moodflix Studio – 2025</div>
        </div>
      </div>
    `;

    return this.root;
  }
}

export default RegisterPage;
