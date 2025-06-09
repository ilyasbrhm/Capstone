const getMovieDetailHandler = require('../services/movie-detail-service');
const Joi = require('joi');

module.exports = {
  method: 'GET',
  path: '/movie/{movieId}',
  handler: getMovieDetailHandler,
  options: {
    auth: 'jwt',
    description: 'Get movie details',
    notes: 'Returns detailed information about a specific movie. Requires authentication.',
    tags: ['api', 'movies'],
    validate: {
      params: Joi.object({
        movieId: Joi.number().integer().required()
          .description('ID of the movie to get details for')
      })
    }
  }
};