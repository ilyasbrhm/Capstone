const mlService = require('./ml-service');

async function getAdvancedRecommendations(mood, top_k = 5) {
  try {
    // Ensure top_k is between 1 and 5
    top_k = Math.max(1, Math.min(5, parseInt(top_k) || 5));
    
    console.log('=== DEBUG INFO ===');
    console.log('1. Input parameters:');
    console.log('- Mood:', mood);
    console.log('- Top K:', top_k);
    
    // Dapatkan prediksi film dari model ML
    console.log('\n2. Getting movie predictions from ML model...');
    const result = await mlService.predict(mood, top_k);
    console.log('- Number of recommended movies:', result.recommendations?.length || 0);
    console.log('- Total matching movies for mood:', result.total_matching_movies || 0);
    
    return {
      message: `Rekomendasi film untuk mood: ${mood}`,
      mood: result.mood || mood,
      total_matching_movies: result.total_matching_movies || 0,
      count: result.recommendations?.length || 0,
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error('Error in getAdvancedRecommendations:', error);
    throw error;
  }
}

module.exports = {
  getAdvancedRecommendations
};