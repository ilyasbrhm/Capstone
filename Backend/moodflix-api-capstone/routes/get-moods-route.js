const getMoodsHandler = require('../services/moods-service');

module.exports = {
  method: 'GET',
  path: '/moods',
  handler: getMoodsHandler,
  options: {
    auth: false,
    description: 'Get available moods',
    notes: 'Returns a list of all available moods from the ML model',
    tags: ['api', 'moods']
  }
};