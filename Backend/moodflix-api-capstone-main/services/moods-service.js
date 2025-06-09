const mlService = require('./ml-service');

module.exports = async (request, h) => {
  try {
    const moods = await mlService.getMoods();
    return moods;
  } catch (err) {
    console.error('=== Service Error ===');
    console.error('Error:', err);
    
    return h.response({ 
      error: 'Internal server error',
      details: err.message 
    }).code(500);
  }
};