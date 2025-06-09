const Joi = require('@hapi/joi');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Lokasi file untuk menyimpan komentar
const COMMENT_FILE = path.join(__dirname, '..', 'data', 'comments.json');

// Pastikan direktori data ada
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Pastikan file komentar ada
if (!fs.existsSync(COMMENT_FILE)) {
  fs.writeFileSync(COMMENT_FILE, JSON.stringify([]), 'utf8');
}

// Schema validasi untuk komentar umum
const generalCommentSchema = Joi.object({
  text: Joi.string().required()
});

// Schema validasi untuk komentar film
const movieCommentSchema = Joi.object({
  movieId: Joi.string().required(),
  movieTitle: Joi.string().required(),
  text: Joi.string().required()
});

// Fungsi untuk membaca semua komentar dari file
const getComments = () => {
  try {
    const data = fs.readFileSync(COMMENT_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading comments file:', err);
    return [];
  }
};

// Fungsi untuk menyimpan komentar ke file
const saveComments = (comments) => {
  try {
    fs.writeFileSync(COMMENT_FILE, JSON.stringify(comments, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving comments file:', err);
    return false;
  }
};

// Handler untuk mendapatkan semua komentar
const getAllComments = async (request, h) => {
  try {
    const comments = getComments();
    return { 
      message: 'Comments retrieved successfully',
      comments 
    };
  } catch (err) {
    console.error('Error getting all comments:', err);
    return h.response({ 
      error: 'Error retrieving comments',
      details: err.message 
    }).code(500);
  }
};

// Handler untuk mendapatkan komentar berdasarkan ID film
const getMovieComments = async (request, h) => {
  try {
    const { movieId } = request.params;
    
    if (!movieId) {
      return h.response({ 
        error: 'Missing movie ID',
        details: 'Movie ID is required' 
      }).code(400);
    }
    
    const comments = getComments().filter(comment => comment.movieId === movieId);
    
    return { 
      message: `Comments for movie ID ${movieId} retrieved successfully`,
      movieId,
      count: comments.length,
      comments 
    };
  } catch (err) {
    console.error('Error getting movie comments:', err);
    return h.response({ 
      error: 'Error retrieving movie comments',
      details: err.message 
    }).code(500);
  }
};

// Handler untuk mengupdate komentar yang ada
const updateComment = async (request, h) => {
  try {
    const { commentId } = request.params;
    
    // Baca komentar yang ada
    const comments = getComments();
    const commentIndex = comments.findIndex(comment => comment.id === commentId);
    
    if (commentIndex === -1) {
      return h.response({ 
        error: 'Comment not found',
        details: `No comment found with ID ${commentId}` 
      }).code(404);
    }

    const existingComment = comments[commentIndex];
    const isMovieComment = existingComment.movieId !== undefined;

    // Validasi payload berdasarkan tipe komentar
    let validatedData;
    if (isMovieComment) {
      const { error, value } = movieCommentSchema.validate(request.payload);
      if (error) {
        return h.response({ 
          error: 'Invalid movie comment data',
          details: error.details.map(d => d.message) 
        }).code(400);
      }
      validatedData = value;
    } else {
      const { error, value } = generalCommentSchema.validate(request.payload);
      if (error) {
        return h.response({ 
          error: 'Invalid general comment data',
          details: error.details.map(d => d.message) 
        }).code(400);
      }
      validatedData = value;
    }
    
    // Update komentar
    const updatedComment = {
      ...existingComment,
      ...validatedData,
      updatedAt: new Date().toISOString()
    };
    
    comments[commentIndex] = updatedComment;
    
    // Simpan kembali ke file
    if (!saveComments(comments)) {
      return h.response({ 
        error: 'Failed to update comment',
        details: 'Error writing to comments file' 
      }).code(500);
    }
    
    return {
      message: 'Comment updated successfully',
      comment: updatedComment
    };
  } catch (err) {
    console.error('Error updating comment:', err);
    return h.response({ 
      error: 'Error updating comment',
      details: err.message 
    }).code(500);
  }
};

// Handler untuk menghapus komentar
const deleteComment = async (request, h) => {
  try {
    const { commentId } = request.params;
    
    // Baca komentar yang ada
    const comments = getComments();
    const commentIndex = comments.findIndex(comment => comment.id === commentId);
    
    if (commentIndex === -1) {
      return h.response({ 
        error: 'Comment not found',
        details: `No comment found with ID ${commentId}` 
      }).code(404);
    }

    const comment = comments[commentIndex];
    const isMovieComment = comment.movieId !== undefined;

    // Hapus komentar
    const deletedComment = comments[commentIndex];
    comments.splice(commentIndex, 1);
    
    // Simpan kembali ke file
    if (!saveComments(comments)) {
      return h.response({ 
        error: 'Failed to delete comment',
        details: 'Error writing to comments file' 
      }).code(500);
    }
    
    return {
      message: isMovieComment ? 'Movie comment deleted successfully' : 'General comment deleted successfully',
      deletedComment
    };
  } catch (err) {
    console.error('Error deleting comment:', err);
    return h.response({ 
      error: 'Error deleting comment',
      details: err.message 
    }).code(500);
  }
};

// Handler untuk mendapatkan komentar terbaru untuk halaman home
const getLatestComments = async (request, h) => {
    try {
        const { limit = 5 } = request.query; // Default 5 komentar
      
      // Baca semua komentar
      const comments = getComments();
      
      // Sorting berdasarkan tanggal terbaru
      const sortedComments = comments.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      // Ambil sejumlah yang diminta
      const latestComments = sortedComments.slice(0, parseInt(limit));
      
      return { 
        message: 'Latest comments retrieved successfully',
        comments: latestComments
      };
    } catch (err) {
      console.error('Error getting latest comments:', err);
      return h.response({ 
        error: 'Error retrieving latest comments',
        details: err.message 
      }).code(500);
    }
};

// Fungsi untuk mendapatkan komentar film secara sinkronus (untuk digunakan di service lain)
const getMovieCommentsSync = (movieId) => {
  try {
    const comments = getComments();
    return comments.filter(comment => comment.movieId === movieId);
  } catch (err) {
    console.error('Error getting movie comments sync:', err);
    return [];
  }
};

// Handler untuk menambahkan komentar umum (homepage)
const addGeneralCommentAuth = async (request, h) => {
  try {
    const userId = request.auth.credentials.id;
    const username = request.auth.credentials.username;
    const { text } = request.payload;
    if (!text) {
      return h.response({ error: 'Invalid comment data', details: 'Text is required' }).code(400);
    }
    const newComment = {
      id: uuidv4(),
      userId,
      username,
      text,
      createdAt: new Date().toISOString()
    };
    const comments = getComments();
    comments.push(newComment);
    if (!saveComments(comments)) {
      return h.response({ error: 'Failed to save comment', details: 'Error writing to comments file' }).code(500);
    }
    return h.response({ message: 'Comment added successfully', comment: newComment }).code(201);
  } catch (err) {
    console.error('Error adding comment:', err);
    return h.response({ error: 'Error adding comment', details: err.message }).code(500);
  }
};

// Handler untuk menambahkan komentar pada film tertentu
const addMovieCommentAuth = async (request, h) => {
  try {
    const userId = request.auth.credentials.id;
    const username = request.auth.credentials.username;
    const { text, movieTitle } = request.payload;
    const { movieId } = request.params;
    if (!text || !movieTitle) {
      return h.response({ error: 'Invalid comment data', details: 'Text and movieTitle are required' }).code(400);
    }
    const newComment = {
      id: uuidv4(),
      userId,
      username,
      movieId,
      movieTitle,
      text,
      createdAt: new Date().toISOString()
    };
    const comments = getComments();
    comments.push(newComment);
    if (!saveComments(comments)) {
      return h.response({ error: 'Failed to save comment', details: 'Error writing to comments file' }).code(500);
    }
    return h.response({ message: 'Comment added successfully', comment: newComment }).code(201);
  } catch (err) {
    console.error('Error adding movie comment:', err);
    return h.response({ error: 'Error adding movie comment', details: err.message }).code(500);
  }
};

module.exports = {
  getAllComments,
  getMovieComments,
  updateComment,
  deleteComment,
  getLatestComments,
  getMovieCommentsSync,
  addGeneralCommentAuth,
  addMovieCommentAuth,
  getComments
};