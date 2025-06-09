const Joi = require('joi');
const { getAdvancedRecommendations } = require('../services/advanced-recommend-service');

function toTitleCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

module.exports = [
  {
    method: 'POST',
    path: '/recommend/advanced',
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          mood: Joi.string().valid(
            'cheerful', 'emotional', 'energetic', 'imaginative', 
            'insightful', 'romantic', 'thrilling', 'neutral',
            'Cheerful', 'Emotional', 'Energetic', 'Imaginative', 
            'Insightful', 'Romantic', 'Thrilling', 'Neutral',
            'CHEERFUL', 'EMOTIONAL', 'ENERGETIC', 'IMAGINATIVE', 
            'INSIGHTFUL', 'ROMANTIC', 'THRILLING', 'NEUTRAL'
          ).required(),
          top_k: Joi.number().integer().min(1).max(5).optional().default(5)
        })
      }
    },
    handler: async (request, h) => {
      try {
        console.log('Received payload:', JSON.stringify(request.payload, null, 2));
        const { mood, top_k = 5 } = request.payload;
        
        const validatedTopK = Math.max(1, Math.min(5, parseInt(top_k) || 5));
        
        const formattedMood = toTitleCase(mood);
        console.log('Formatted mood:', formattedMood);
        console.log('Using top_k value:', validatedTopK);
        
        const recommendations = await getAdvancedRecommendations(formattedMood, validatedTopK);
        return h.response(recommendations);
      } catch (error) {
        console.error('Error in recommendation handler:', error);
        return h.response({ 
          error: 'Failed to get recommendations',
          details: error.message 
        }).code(500);
      }
    }
  }
];