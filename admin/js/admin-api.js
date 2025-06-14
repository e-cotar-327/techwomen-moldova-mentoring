/**
 * Admin API utilities for TechWomen Moldova Dashboard
 */

class AdminAPI {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  // Update profiles via Netlify function
  async updateProfile(profile, role, action = 'add') {
    try {
      const response = await fetch('/.netlify/functions/update-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profile, role, action })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Get Netlify form submissions
  async getFormSubmissions(token, formId) {
    try {
      const response = await fetch(`https://api.netlify.com/api/v1/forms/${formId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Netlify API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  }

  // Test Netlify connection
  async testNetlifyConnection(token, formId) {
    try {
      const response = await fetch(`https://api.netlify.com/api/v1/forms/${formId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Export for global use
window.AdminAPI = AdminAPI;
