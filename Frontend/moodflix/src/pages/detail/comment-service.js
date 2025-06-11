class CommentService {
    constructor() {
      this.apiBaseUrl = 'https://moodflix-api-capstone-production.up.railway.app'; 
    }
  
    async getAllComments() {
      try {
        const response = await fetch(`${this.apiBaseUrl}/comments`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching all comments:', error);
        throw error;
      }
    }
  
    async getMovieComments(movieId) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/comments/movie/${movieId}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching movie comments:', error);
        throw error;
      }
    }
  
    async addGeneralComment(commentText) {
      try {
        if (!window.authToken) {
          throw new Error('Authentication required');
        }
  
        const response = await fetch(`${this.apiBaseUrl}/comments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${window.authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: commentText  
          })
        });
  
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required. Please login again.');
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error adding general comment:', error);
        throw error;
      }
    }
  
    async addMovieComment(movieId, commentText, movieTitle = 'Unknown Movie') {
      try {
        if (!window.authToken) {
          throw new Error('Authentication required');
        }
  
        const response = await fetch(`${this.apiBaseUrl}/comments/movie/${movieId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${window.authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: commentText,        
            movieTitle: movieTitle  
          })
        });
  
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required. Please login again.');
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error adding movie comment:', error);
        throw error;
      }
    }
  
    async updateGeneralComment(commentId, commentText) {
      try {
        if (!window.authToken) {
          throw new Error('Authentication required');
        }
  
        const response = await fetch(`${this.apiBaseUrl}/comments/general/${commentId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${window.authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: commentText  
          })
        });
  
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required. Please login again.');
          }
          if (response.status === 403) {
            throw new Error('You are not authorized to modify this comment.');
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error updating general comment:', error);
        throw error;
      }
    }
  
async updateMovieComment(commentId, commentText, movieId, movieTitle = 'Unknown Movie') {
  try {
    if (!window.authToken) {
      throw new Error('Authentication required');
    }

    if (!movieId) {
      throw new Error('Movie ID is required for updating movie comment');
    }

    const movieIdString = String(movieId);

    const response = await fetch(`${this.apiBaseUrl}/comments/movie/${commentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${window.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        movieId: movieIdString, 
        text: commentText,
        movieTitle: movieTitle
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('You are not authorized to modify this comment.');
      }
      
      const errorText = await response.text();
      console.error('Server response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      } catch (e) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating movie comment:', error);
    throw error;
  }
}
  
    async deleteComment(commentId) {
      try {
        if (!window.authToken) {
          throw new Error('Authentication required');
        }
  
        const response = await fetch(`${this.apiBaseUrl}/comments/${commentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${window.authToken}`,
            'Content-Type': 'application/json'
          }
        });
  
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required. Please login again.');
          }
          if (response.status === 403) {
            throw new Error('You are not authorized to delete this comment.');
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }
    }

    async getLatestComments(limit = 5) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/comments/latest?limit=${limit}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching latest comments:', error);
        throw error;
      }
    }
  }

  window.CommentService = new CommentService();