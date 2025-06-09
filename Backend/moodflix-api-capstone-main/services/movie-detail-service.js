const mlService = require('./ml-service');

module.exports = async (request, h) => {
  try {
    const movieId = request.params.movieId;
    const movieDetails = await mlService.getMovieDetails(movieId);
    
    if (!movieDetails) {
      return h.response({ 
        error: 'Movie not found' 
      }).code(404);
    }
    
    return movieDetails;
  } catch (err) {
    console.error('=== Service Error ===');
    console.error('Error:', err);
    
    return h.response({ 
      error: 'Internal server error',
      details: err.message 
    }).code(500);
  }
};