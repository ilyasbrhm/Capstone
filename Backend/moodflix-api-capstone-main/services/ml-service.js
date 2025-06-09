const axios = require('axios');

const ML_SERVER_URL = 'https://web-production-21b6.up.railway.app';

async function predict(mood, top_k = 5) {
  try {
    // Batasi top_k maksimal 5
    top_k = Math.min(5, top_k || 5);
    
    console.log(`Calling ML server with mood: ${mood}, top_k: ${top_k}`);
    
    // Kirim request ke ML server untuk mendapatkan prediksi
    const response = await axios.post(`${ML_SERVER_URL}/predict`, {
      mood,
      top_k
    });
    
    console.log('ML server response received successfully');
    return response.data;
  } catch (error) {
    console.error('Error calling ML server:', error.message);
    if (error.response) {
      console.error('ML server error response:', error.response.data);
      throw new Error(`ML server error: ${error.response.data.error || error.response.statusText}`);
    }
    throw new Error('Gagal mendapatkan prediksi dari model ML');
  }
}

/**
 * Mendapatkan daftar mood yang tersedia
 * @returns {Promise<string[]>} - Array mood yang tersedia
 */
async function getMoods() {
  try {
    const response = await axios.get(`${ML_SERVER_URL}/moods`);
    return response.data;
  } catch (error) {
    console.error('Error getting moods:', error);
    throw new Error('Failed to get moods from ML server');
  }
}

/**
 * Mendapatkan daftar genre yang tersedia
 * @returns {Promise<string[]>} - Array genre yang tersedia
 */
async function getGenres() {
  try {
    const response = await axios.get(`${ML_SERVER_URL}/genres`);
    return response.data;
  } catch (error) {
    console.error('Error getting genres:', error);
    throw new Error('Failed to get genres from ML server');
  }
}

/**
 * Mendapatkan detail film berdasarkan ID
 * @param {number} movieId - ID film yang dicari
 * @returns {Promise<Object>} - Detail film
 */
async function getMovieDetails(movieId) {
  try {
    const response = await axios.get(`${ML_SERVER_URL}/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting movie details:', error);
    throw new Error('Failed to get movie details from ML server');
  }
}

module.exports = {
  predict,
  getMoods,
  getGenres,
  getMovieDetails
};