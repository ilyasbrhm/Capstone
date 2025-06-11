import '../../../styles/auth.css';
import MoodFlix from '../../../img/MoodFlix.png';

class LoginPage {
  constructor() {
    this.root = document.createElement("div");
    this.root.className = "auth-container";
  }

  render() {
    this.root.innerHTML = `
      <div class="auth-form">
        <button class="close-modal-btn" id="closeLoginModal" title="Tutup">×</button>
        <img src="${MoodFlix}" alt="Moodflix Logo">
        <h2>Log In</h2>
        <form id="loginForm">
          <div class="form-group">
            <input type="email" id="email" name="email" placeholder="Email" required />
          </div>
          <div class="form-group">
            <input type="password" id="password" name="password" placeholder="Password" required />
          </div>
          <button type="submit">Login</button>
          <div class="form-links">
            <p>Don't have an account? <a href="#" id="goToRegister">Sign in</a></p> 
          </div>
        </form>
        <div id="loginMessage" class="message"></div>
        <div class="footer-text">Moodflix Studio – 2025</div>
      </div>
   `;
    return this.root;
  }
}

export default LoginPage;
