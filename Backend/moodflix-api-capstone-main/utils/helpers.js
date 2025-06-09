const formatMood = (mood) => {
    if (!mood) return '';
    // Capitalize first letter, lowercase the rest
    return mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase();
  };
  
  module.exports = {
    formatMood
  };