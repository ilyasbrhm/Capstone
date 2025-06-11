import { comment, mlogo, moodflix } from "../../img.js";
import AboutPage from "../about/about-page.js";
import "../../styles/home.css";

class HomeView {
  constructor() {
    this.root = document.createElement("div");
    this.root.className = "home-container";
  }

  render() {
    const aboutPage = new AboutPage();

    this.root.innerHTML = `
    <header class="navbar">
      <div class="logo">
        <img src="${mlogo}" alt="M FLIX STUDIO" class="logo-img" />
      </div>
      <div class="hamburger-menu">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <nav class="menu">
        <a href="#">Home</a>
        <a href="#about">About Us</a>
        <a href="#coment">Comment</a>
      </nav>
    </header>

    <section class="hero" id="#">
      <h1 class="logo-text"></h1>
      <img src="${moodflix}" alt="Moodflix Logo" />
      <p>Setiap mood punya cerita, dan setiap cerita punya filmnya sendiri. Temuin semuanya di Moodflix!</p>
      <button id="findMovieBtn">Temukan Film</button>
    </section>

    <section class="testimonials">
      <h2>Apa Kata Mereka?</h2>
      <hr class="underline" />
      <div class="testimonial-container">
        <button class="arrow left">❮</button>
        <div class="testimonial-slider" id="testimonialSlider"></div>
        <button class="arrow right">❯</button>
      </div>
    </section>
    `;

    const testimonialsSection = this.root.querySelector(".testimonials");
    this.root.insertBefore(aboutPage.render(), testimonialsSection);

    const commentSection = document.createElement("section");
    commentSection.id = "coment";
    commentSection.className = "comments";

    commentSection.innerHTML = `
      <h2>Comment</h2>
      <div class="comentcard">
        <div id="authRequiredMessage">
          <p>Login diperlukan untuk memberikan komentar</p>
          <p>Berikan komentar kamu di sini ya, tapi jangan lupa login dulu!</p>
          <button type="button" id="goToLoginFromComment">Login</button>
          <button type="button" id="goToRegisterFromComment">Register</button>
        </div>

        <div id="commentFormFields">
          <div id="commentStatus"></div>
          <form id="commentForm">
            <div>
              <div>
                <textarea id="commentText" name="commentText" placeholder="Tambahkan Komentar" rows="4" required></textarea>
                <button type="submit" id="submitComment">Kirim Komentar</button>
              </div>
              <div class="comment-illustration">
                <img src="${comment}" alt="Comment illustration">
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div id="recentComments">
        <h3><---Komentar Terbaru---></h3>
        <div id="commentsContainer">
          <div class="loading-comments">
            <p>Memuat komentar terbaru...</p>
          </div>
        </div>
      </div>
    `;
    testimonialsSection.insertAdjacentElement("afterend", commentSection);

    const footer = document.createElement("footer");
    footer.textContent = "Moodflix Studio - 2025";
    this.root.appendChild(footer);

    return this.root;
  }

  renderTestimonials(comments) {
    const slider = this.root.querySelector("#testimonialSlider");
    if (!slider) return;

    if (!comments || comments.length === 0) {
      slider.innerHTML = `
        <div class="testimonial-card">
          <div class="user-info">
            <span class="icon">👤</span>
            <div>
              <strong>Belum ada komentar</strong>
              <p class="date">-</p>
            </div>
          </div>
          <div class="text-container">
            <p class="text">Jadilah yang pertama memberikan komentar!</p>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="user-info">
            <span class="icon">🎬</span>
            <div>
              <strong>Moodflix Team</strong>
              <p class="date">Hari ini</p>
            </div>
          </div>
          <div class="text-container">
            <p class="text">Selamat datang di Moodflix! Temukan film sesuai mood Anda.</p>
          </div>
        </div>
      `;
      return;
    }

    const testimonialsToShow = comments.slice(0, 5);
    slider.innerHTML = testimonialsToShow
      .map((comment) => {
        const username = comment.username || comment.user?.username || "Anonymous";
        const text = comment.text || "Tidak ada komentar";
        const createdAt = comment.createdAt || new Date().toISOString();

        return `
          <div class="testimonial-card" style="display: block;">
            <div class="user-info">
              <span class="icon">${username.charAt(0).toUpperCase()}</span>
              <div>
                <strong>${this.escapeHtml(username)}</strong>
                <p class="date">${this.formatDate(createdAt)}</p>
              </div>
            </div>
            <div class="text-container">
              <p class="text">
                ${this.escapeHtml(text).substring(0, 150)}${text.length > 150 ? "..." : ""}
              </p>
            </div>
          </div>
        `;
      })
      .join("");

    // Paksa tampil 2 pertama
    setTimeout(() => {
      const cards = slider.querySelectorAll(".testimonial-card");
      if (cards[0]) cards[0].style.display = "block";
      if (cards[1]) cards[1].style.display = "block";
    }, 100);
  }

  renderRecentComments(comments) {
    const container = this.root.querySelector("#commentsContainer");
    const currentUser = window.currentUser;

    if (!comments || comments.length === 0) {
      container.innerHTML = `<div class="loading-comments"><p>Belum ada komentar. Jadilah yang pertama!</p></div>`;
      container.style.display = "grid";
      container.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))";
      container.style.gap = "20px";
      return;
    }

    container.style.display = "grid";
    container.style.gridTemplateColumns = "1fr 1fr";
    container.style.gap = "20px";

    container.innerHTML = comments
      .map((comment) => {
        const isOwnComment = currentUser && comment.user_id === currentUser.id;
        return `
          <div class="comment-card">
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="user-avatar">${(comment.username || "A").charAt(0).toUpperCase()}</span>
                <div>
                  <strong>${this.escapeHtml(comment.username || "Anonymous")}</strong>
                  ${comment.movieTitle ? `<div style="font-size: 12px; color: #666;">Komentar pada: ${this.escapeHtml(comment.movieTitle)}</div>` : ""}
                </div>
              </div>
              <span style="font-size: 12px; color: #666;">${formatCommentTime(comment.createdAt)}</span>
            </div>
            <p>${this.escapeHtml(comment.text || "")}</p>
            ${isOwnComment ? `
              <div class="comment-actions">
                <button class="edit-comment-btn" data-id="${comment.id}">Edit</button>
                <button class="delete-comment-btn" data-id="${comment.id}">Hapus</button>
              </div>
            ` : ""}
          </div>
        `;
      })
      .join("");
  }

  showStatus(message, type = "info") {
    const statusDiv = this.root.querySelector("#commentStatus");
    const colors = {
      success: { bg: "#d4edda", border: "#c3e6cb", text: "#155724" },
      error: { bg: "#f8d7da", border: "#f5c6cb", text: "#721c24" },
      info: { bg: "#d1ecf1", border: "#bee5eb", text: "#0c5460" },
    };
    const color = colors[type] || colors.info;

    statusDiv.style.cssText = `
      display: block;
      background: ${color.bg};
      border: 1px solid ${color.border};
      color: ${color.text};
      padding: 12px;
      border-radius: 5px;
      margin-bottom: 15px;
    `;
    statusDiv.textContent = message;

    setTimeout(() => {
      statusDiv.style.display = "none";
    }, 5000);
  }

  updateCommentFormVisibility(isAuthenticated) {
    const authMessage = this.root.querySelector("#authRequiredMessage");
    const formFields = this.root.querySelector("#commentFormFields");

    if (isAuthenticated) {
      if (authMessage) authMessage.style.display = "none";
      if (formFields) formFields.style.display = "block";
    } else {
      if (authMessage) authMessage.style.display = "block";
      if (formFields) formFields.style.display = "none";
    }
  }

  resetCommentForm() {
    const textarea = this.root.querySelector("#commentFormFields #commentText");
    if (textarea) textarea.value = "";
  }

  setCommentSubmitLoading(isLoading) {
    const submitBtn = this.root.querySelector("#submitComment");
    if (submitBtn) {
      submitBtn.textContent = isLoading ? "Mengirim..." : "Kirim Komentar";
      submitBtn.disabled = isLoading;
      submitBtn.style.opacity = isLoading ? "0.7" : "1";
    }
  }

  escapeHtml(text) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  formatDate(dateString) {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffDays = Math.floor((nowOnly - dateOnly) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Hari ini";
      if (diffDays === 1) return "Kemarin";
      if (diffDays < 7) return `${diffDays} hari lalu`;

      return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return "-";
    }
  }
}

function formatCommentTime(isoString) {
  const date = new Date(isoString);
  return (
    date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }) + " WIB"
  );
}

export default HomeView;
