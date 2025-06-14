/**
 * Enhanced admin dashboard with real JSON file updates
 * This extends the main AdminDashboard class with Netlify Function integration
 */

// Override the addToJSONFile method to use the Netlify function
if (typeof AdminDashboard !== 'undefined') {
  AdminDashboard.prototype.addToJSONFile = async function(profile, role) {
    try {
      const api = new AdminAPI();
      const result = await api.updateProfile(profile, role, 'add');
      
      // Update local data to match
      if (role === 'mentor') {
        this.approvedProfiles.mentors.push(profile);
      } else {
        this.approvedProfiles.mentees.push(profile);
      }
      
      console.log('Profile successfully added to JSON file:', result);
      return result;
      
    } catch (error) {
      console.error('Error adding profile to JSON file:', error);
      
      // Fallback: update local data only (for demo purposes)
      if (role === 'mentor') {
        this.approvedProfiles.mentors.push(profile);
      } else {
        this.approvedProfiles.mentees.push(profile);
      }
      
      this.showNotification('Profile added locally (JSON update pending)', 'warning');
      throw error;
    }
  };
}
