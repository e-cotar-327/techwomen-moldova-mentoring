/**
 * Admin UI utilities for TechWomen Moldova Dashboard
 */

class AdminUI {
  // Show notification
  static showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; font-size: 1.2em; cursor: pointer; margin-left: 10px;">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
  }

  // Show loading spinner
  static showLoading(element, show = true) {
    if (!element) return;

    if (show) {
      element.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
          <p>Loading...</p>
        </div>
      `;
    } else {
      // Remove loading state - this would be handled by rendering actual content
    }
  }

  // Format date for display
  static formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Sanitize HTML to prevent XSS
  static sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  // Truncate text
  static truncateText(text, maxLength = 150) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // Confirm action
  static confirmAction(message) {
    return confirm(message);
  }
}

// Export for global use
window.AdminUI = AdminUI;

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
