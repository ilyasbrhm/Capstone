const {
    getAllComments,
    getMovieComments,
    addGeneralCommentAuth,
    addMovieCommentAuth,
    updateComment,
    deleteComment,
    getLatestComments,
    getComments
  } = require('../services/comment-service');
  
  const commentService = require('../services/comment-service');
  
  module.exports = [
    // Mendapatkan semua komentar (no auth required)
    {
      method: 'GET',
      path: '/comments',
      handler: getAllComments,
      options: {
        auth: false
      }
    },
    
    // Mendapatkan komentar untuk film tertentu (no auth required)
    {
      method: 'GET',
      path: '/comments/movie/{movieId}',
      handler: getMovieComments,
      options: {
        auth: false
      }
    },
    
    // Menambahkan komentar umum (homepage) (requires auth)
    {
      method: 'POST',
      path: '/comments',
      handler: addGeneralCommentAuth,
      options: {
        auth: 'jwt'
      }
    },

    // Menambahkan komentar pada film tertentu (requires auth)
    {
      method: 'POST',
      path: '/comments/movie/{movieId}',
      handler: addMovieCommentAuth,
      options: {
        auth: 'jwt'
      }
    },
    
    // Mengupdate komentar umum (requires auth and ownership check)
    {
      method: 'PUT',
      path: '/comments/general/{commentId}',
      handler: updateComment,
      options: {
        auth: 'jwt',
        pre: [
          { method: checkCommentOwnership }
        ]
      }
    },

    // Mengupdate komentar film (requires auth and ownership check)
    {
      method: 'PUT',
      path: '/comments/movie/{commentId}',
      handler: updateComment,
      options: {
        auth: 'jwt',
        pre: [
          { method: checkCommentOwnership }
        ]
      }
    },
    
    // Menghapus komentar (requires auth and ownership check)
    {
      method: 'DELETE',
      path: '/comments/{commentId}',
      handler: deleteComment,
      options: {
        auth: 'jwt',
        pre: [
          { method: checkCommentOwnership }
        ]
      }
    },
    
    // Mendapatkan komentar terbaru (no auth required)
    {
      method: 'GET',
      path: '/comments/latest',
      handler: getLatestComments,
      options: {
        auth: false
      }
    }
  ];
  
  // Middleware untuk memeriksa kepemilikan komentar
  async function checkCommentOwnership(request, h) {
    try {
      const { commentId } = request.params;
      const userId = request.auth.credentials.id;
      
      // Ambil komentar dari database
      const comments = getComments();
      const comment = comments.find(c => c.id === commentId);
      
      if (!comment) {
        return h.response({
          error: 'Comment not found'
        }).code(404).takeover();
      }
      
      // Cek kepemilikan
      if (comment.userId !== userId) {
        return h.response({
          error: 'You are not authorized to modify this comment'
        }).code(403).takeover();
      }
      
      // Lanjutkan ke handler berikutnya
      return comment;
    } catch (err) {
      console.error('Error in checkCommentOwnership:', err);
      return h.response({
        error: 'Internal server error in ownership check',
        details: err.message
      }).code(500).takeover();
    }
  }