class MovieDetailPages {
  showMovieDetailModal(movieData) {
    const modal = document.createElement("div");
    modal.className = "movie-detail-modal-overlay";

    const modalContent = document.createElement("div");
    modalContent.className = "movie-detail-modal-content";

    modalContent.innerHTML = `
  <div class="movie-info-container">
    <div class="movie-poster-container">
      <img 
        class="movie-poster"
        src="${movieData.poster_url || "https://via.placeholder.com/200x300/cccccc/666666?text=No+Image"}" 
        alt="${movieData.title || "Movie Poster"}"
        onerror="this.src='https://via.placeholder.com/200x300/cccccc/666666?text=No+Image'"
      />
    </div>

    <div class="movie-details">
      <h2 class="movie-title">
        ${movieData.title || "Unknown Title"}
      </h2>
      <hr class="movie-divider">

      <div class="movie-genre-container">
        <strong class="movie-genre-label">Genre:</strong><br>
        <span class="movie-genre">${movieData.genres || movieData.genre || movieData.category || "N/A"}</span>
      </div>

      <div class="movie-info-grid">
        <div class="movie-info-item">
          <strong class="movie-info-label">Tahun Rilis:</strong><br>
          <span class="movie-release-year">${movieData.release_year || movieData.year || movieData.released || "N/A"}</span>
        </div>
        <div class="movie-info-item">
          <strong class="movie-info-label">Rating:</strong><br>
          <span class="movie-rating">
            ${movieData.rating || movieData.imdb_score || movieData.imdb_rating || "N/A"}${movieData.rating || movieData.imdb_score || movieData.imdb_rating ? "/10" : ""}
          </span>
        </div>
      </div>

      ${movieData.description || movieData.plot ? `
        <div class="movie-synopsis-container">
          <strong class="movie-synopsis-label">Sinopsis:</strong>
          ${movieData.description || movieData.plot}
        </div>
      ` : ""}
    </div>
  </div>
      
      <div class="movie-comments-section">
        <h3 class="movie-comments-title">Komentar Film</h3>
        
        <!-- Form untuk menambah komentar (hanya jika sudah login) -->
        ${window.authToken ? `
          <div class="add-comment-container">
            <h4 class="add-comment-title">Tambah Komentar</h4>
            <textarea 
              id="newMovieComment" 
              class="comment-textarea"
              placeholder="Tulis komentar Anda tentang film ini..."
            ></textarea>
            <button id="submitMovieComment" class="submit-comment-btn">Kirim Komentar</button>
          </div>
        ` : `
          <div class="login-required-container">
            <p class="login-required-text">
              <strong>Login diperlukan</strong> untuk menambahkan komentar.
            </p>
          </div>
        `}
        
        <!-- Container untuk menampilkan komentar -->
        <div id="movieCommentsContainer">
          <div class="comments-loading">
            Memuat komentar...
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
          <button id="closeDetailModal" class="close-detail-btn">×</button>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    const closeBtn = document.getElementById("closeDetailModal");

    closeBtn.addEventListener("mouseover", function () {
      closeBtn.style.color = "#FFEB00";
      closeBtn.style.transform = "scale(1.2)";
    });

    closeBtn.addEventListener("mouseout", function () {
      closeBtn.style.color = "#fff";
      closeBtn.style.transform = "scale(1)";
    });

    // Load komentar untuk film ini dengan pengecekan service
    this.loadMovieComments(movieData.id || movieData.movie_id);

    // Event handler untuk submit komentar
    const submitBtn = modalContent.querySelector("#submitMovieComment");
    if (submitBtn) {
      submitBtn.addEventListener("click", async () => {
        const commentText = modalContent
          .querySelector("#newMovieComment")
          .value.trim();
        if (!commentText) {
          alert("Komentar tidak boleh kosong!");
          return;
        }

        // Check if CommentService is available
        if (!this.isCommentServiceAvailable()) {
          alert("Service komentar tidak tersedia saat ini.");
          return;
        }

        try {
          submitBtn.disabled = true;
          submitBtn.textContent = "Mengirim...";

          // DIPERBAIKI: Kirim movieTitle juga
          const movieTitle = movieData.title || "Unknown Movie";
          await window.CommentService.addMovieComment(
            movieData.id || movieData.movie_id,
            commentText,
            movieTitle // ← DITAMBAHKAN: kirim judul film
          );

          // Clear form
          modalContent.querySelector("#newMovieComment").value = "";

          // Reload komentar
          this.loadMovieComments(movieData.id || movieData.movie_id);

          alert("Komentar berhasil ditambahkan!");
        } catch (error) {
          console.error("Error adding comment:", error);
          alert("Gagal menambahkan komentar: " + error.message);
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Kirim Komentar";
        }
      });
    }

    // Event handlers
    modalContent
      .querySelector("#closeDetailModal")
      .addEventListener("click", () => {
        document.body.removeChild(modal);
      });

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  // Helper method to check if CommentService is available
  isCommentServiceAvailable() {
    return (
      window.CommentService &&
      typeof window.CommentService.getMovieComments === "function"
    );
  }

  async loadMovieComments(movieId) {
    const container = document.querySelector("#movieCommentsContainer");
    if (!container) return;

    // Check if CommentService is available
    if (!this.isCommentServiceAvailable()) {
      container.innerHTML = `
        <div class="comments-error-container">
          <p>Service komentar tidak tersedia.</p>
          <p style="font-size: 14px;">Pastikan CommentService telah dimuat dengan benar.</p>
        </div>
      `;
      return;
    }

    try {
      const commentsData = await window.CommentService.getMovieComments(
        movieId
      );
      const comments = commentsData.comments || [];

      if (comments.length === 0) {
        container.innerHTML = `
          <div class="no-comments-container">
            <p>Belum ada komentar untuk film ini.</p>
            <p style="font-size: 14px;">Jadilah yang pertama memberikan komentar!</p>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="comments-container">
            ${comments
              .map((comment) => this.renderCommentItem(comment))
              .join("")}
          </div>
        `;

        // Add event listeners untuk edit/delete buttons
        this.addCommentEventListeners(movieId);
      }
    } catch (error) {
      console.error("Error loading movie comments:", error);
      container.innerHTML = `
        <div class="comments-error-container">
          <p>Gagal memuat komentar.</p>
          <p style="font-size: 14px;">${error.message}</p>
        </div>
      `;
    }
  }

  renderCommentItem(comment) {
    const isOwner =
      window.currentUser && comment.userId === window.currentUser.id;
    const commentDate = comment.createdAt
      ? new Date(comment.createdAt).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return `
      <div class="comment-item" data-comment-id="${comment.id}">
        <div class="comment-header">
          <div class="comment-user-info">
            <strong class="comment-username">${
              comment.username ||
              comment.user_name ||
              comment.userName ||
              "Anonymous"
            }</strong>
            <span class="comment-date">${commentDate}</span>
          </div>
          ${isOwner ? `
            <div class="comment-actions">
              <button class="edit-comment-btn" data-comment-id="${comment.id}">Edit</button>
              <button class="delete-comment-btn" data-comment-id="${comment.id}">Hapus</button>
            </div>
          ` : ""}
        </div>
        <div class="comment-text">
          ${comment.text || comment.comment || comment.content || ""}
        </div>
        ${isOwner ? `
          <div class="edit-form">
            <textarea class="edit-textarea">${
              comment.text || comment.comment || comment.content || ""
            }</textarea>
            <div>
              <button class="save-edit-btn">Simpan</button>
              <button class="cancel-edit-btn">Batal</button>
            </div>
          </div>
        ` : ""}
      </div>
    `;
  }

  addCommentEventListeners(movieId) {
    // Edit comment buttons
    document.querySelectorAll(".edit-comment-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const commentItem = e.target.closest(".comment-item");
        const commentText = commentItem.querySelector(".comment-text");
        const editForm = commentItem.querySelector(".edit-form");

        commentText.style.display = "none";
        editForm.style.display = "block";
        e.target.style.display = "none";
      });
    });

    // Cancel edit buttons
    document.querySelectorAll(".cancel-edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const commentItem = e.target.closest(".comment-item");
        const commentText = commentItem.querySelector(".comment-text");
        const editForm = commentItem.querySelector(".edit-form");
        const editBtn = commentItem.querySelector(".edit-comment-btn");

        commentText.style.display = "block";
        editForm.style.display = "none";
        editBtn.style.display = "inline-block";
      });
    });

    // Save edit buttons
    document.querySelectorAll(".save-edit-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const commentItem = e.target.closest(".comment-item");
        const commentId = commentItem.dataset.commentId;
        const newText = commentItem
          .querySelector(".edit-textarea")
          .value.trim();

        if (!newText) {
          alert("Komentar tidak boleh kosong!");
          return;
        }

        // Check if CommentService is available
        if (!this.isCommentServiceAvailable()) {
          alert("Service komentar tidak tersedia saat ini.");
          return;
        }

        try {
          btn.disabled = true;
          btn.textContent = "Menyimpan...";

          // Pass movieId as the third parameter, movieTitle as fourth
          const movieTitle = this.currentMovieData?.title || "Unknown Movie";
          await window.CommentService.updateMovieComment(
            commentId,
            newText,
            movieId, // ← DIPERBAIKI: pass movieId sebagai parameter ketiga
            movieTitle // ← movieTitle sebagai parameter keempat
          );

          // Reload comments
          this.loadMovieComments(movieId);

          alert("Komentar berhasil diperbarui!");
        } catch (error) {
          console.error("Error updating comment:", error);
          alert("Gagal memperbarui komentar: " + error.message);
        } finally {
          btn.disabled = false;
          btn.textContent = "Simpan";
        }
      });
    });

    // Delete comment buttons
    document.querySelectorAll(".delete-comment-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const commentId = e.target.dataset.commentId;

        if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) {
          return;
        }

        // Check if CommentService is available
        if (!this.isCommentServiceAvailable()) {
          alert("Service komentar tidak tersedia saat ini.");
          return;
        }

        try {
          await window.CommentService.deleteComment(commentId);

          // Reload comments
          this.loadMovieComments(movieId);

          alert("Komentar berhasil dihapus!");
        } catch (error) {
          console.error("Error deleting comment:", error);
          alert("Gagal menghapus komentar: " + error.message);
        }
      });
    });
  }

  showLoadingModal() {
    const modal = document.createElement("div");
    modal.className = "loading-modal";

    modal.innerHTML = `
      <div class="loading-container">
        <h3>Memuat Detail Film...</h3>
        <div class="loading-spinner"></div>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }
}

// Make it globally available
window.MovieDetailPages = new MovieDetailPages();

const renderMovieCard = (index) => {
  cardContainer.innerHTML = "";
  if (movies.length === 0) return;

  const movie = movies[index];
  const posterUrl = movie.poster_url
    ? movie.poster_url
    : "https://placehold.co/200x300?text=No+Poster";

  const movieCard = document.createElement("div");
  movieCard.className = "movie-card";

  movieCard.innerHTML = `
    <img class="movie-card-poster" src="${posterUrl}" alt="Poster">
    <div class="movie-card-content">
      <h3 class="movie-card-title">${movie.title}</h3>
      <p class="movie-card-year">
        Tahun: ${movie.release_year || movie.release_date?.substring(0, 4) || "N/A"}
      </p>
      <p class="movie-card-rating">
        Rating: ${movie.rating || movie.imdb_score || movie.imdb_rating || "N/A"}/10
      </p>
      <button id="detailBtn" class="movie-detail-btn">Detail</button>
    </div>
  `;
  
  // Handler tombol detail
  movieCard.querySelector("#detailBtn").addEventListener("click", async (e) => {
    e.stopPropagation();
    // Jika belum login, munculkan modal login
    if (!this.isAuthenticated()) {
      this.showAuthRequiredForDetailModal();
      return;
    }
    // Tampilkan loading modal
    const loadingModal = window.MovieDetailPages.showLoadingModal();
    try {
      // Ambil detail film dari backend
      const movieId = movie.movie_id || movie.id;
      const response = await fetch(`${this.apiBaseUrl}/movie/${movieId}`);
      if (!response.ok) throw new Error("Gagal memuat detail film");
      const movieData = await response.json();
      // Tutup loading
      document.body.removeChild(loadingModal);
      // Tampilkan modal detail
      window.MovieDetailPages.showMovieDetailModal(movieData);
      // Tutup modal rekomendasi
      document.querySelectorAll(".modal-overlay").forEach((m) => m.remove());
    } catch (error) {
      document.body.removeChild(loadingModal);
      alert("Gagal memuat detail film: " + error.message);
    }
  });

  cardContainer.appendChild(movieCard);
};
