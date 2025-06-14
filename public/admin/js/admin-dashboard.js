class SecureAdminDashboard {
    constructor() {
        this.submissions = [];
        this.approvedProfiles = { mentors: [], mentees: [] };
        this.settings = this.loadSecureSettings();
        this.currentSection = 'pending';
        this.refreshInterval = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkCredentials();
        this.setupAutoRefresh();
        this.updateUI();
    }

    // Check if credentials are configured
    checkCredentials() {
        if (!this.settings.netlifyToken || !this.settings.formId) {
            this.showCredentialsRequired();
            this.switchSection('settings');
        } else {
            this.loadInitialData();
        }
    }

    showCredentialsRequired() {
        this.showNotification(
            'Please configure your Netlify credentials in Settings first',
            'warning',
            10000
        );
    }

    // SECURE: Load settings from localStorage (browser-only storage)
    loadSecureSettings() {
        const defaultSettings = {
            netlifyToken: '', // NEVER hardcoded
            formId: '', // NEVER hardcoded
            autoRefresh: 60,
        };

        const saved = localStorage.getItem('adminSecureSettings');
        return saved
            ? { ...defaultSettings, ...JSON.parse(saved) }
            : defaultSettings;
    }

    // SECURE: Save settings to localStorage only
    saveSecureSettings() {
        const settings = {
            netlifyToken: document.getElementById('netlify-token').value.trim(),
            formId: document.getElementById('form-id').value.trim(),
            autoRefresh: parseInt(
                document.getElementById('auto-refresh').value
            ),
        };

        // Validate before saving
        if (!settings.netlifyToken || !settings.formId) {
            this.showNotification(
                'Both Netlify token and Form ID are required',
                'error'
            );
            return;
        }

        // SECURE: Only store in browser localStorage
        localStorage.setItem('adminSecureSettings', JSON.stringify(settings));
        this.settings = settings;

        // Restart auto-refresh
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.setupAutoRefresh();

        this.showNotification('Settings saved securely in browser', 'success');

        // Try to load data now that credentials are set
        this.loadInitialData();
    }

    // Load submissions from Netlify API (using stored credentials)
    async loadSubmissions() {
        if (!this.settings.netlifyToken || !this.settings.formId) {
            this.showError('Credentials not configured. Go to Settings.');
            return;
        }

        try {
            this.showLoading(true);

            const response = await fetch(
                `https://api.netlify.com/api/v1/forms/${this.settings.formId}/submissions`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.settings.netlifyToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                }
            );

            // Read response as text first
            const text = await response.text();
            console.log('Raw response:', text);

            if (!response.ok) {
                throw new Error(`Netlify API error: ${response.status}`);
            }

            // Parse the text as JSON (instead of response.json())
            const submissions = JSON.parse(text);
            this.submissions = submissions.filter(
                (sub) => !this.isProcessed(sub.id)
            );

            this.renderPendingSubmissions();
            this.updateSyncStatus('online');
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading submissions:', error);
            this.showError(
                'Failed to load submissions. Check your credentials.'
            );
            this.updateSyncStatus('offline');
            this.showLoading(false);
        }
    }

    // Test connection with current credentials
    async testConnection() {
        const token = document.getElementById('netlify-token').value.trim();
        const formId = document.getElementById('form-id').value.trim();

        if (!token || !formId) {
            this.showNotification(
                'Please enter both token and form ID',
                'error'
            );
            return;
        }

        try {
            this.showNotification('Testing connection...', 'info');

            const response = await fetch(
                `https://api.netlify.com/api/v1/forms/${formId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                this.showNotification('✅ Connection successful!', 'success');
            } else {
                this.showNotification(
                    '❌ Connection failed. Check your credentials.',
                    'error'
                );
            }
        } catch (error) {
            this.showNotification(
                '❌ Connection error. Please try again.',
                'error'
            );
        }
    }

    // Clear all stored credentials (security feature)
    clearCredentials() {
        if (
            confirm(
                'Are you sure you want to clear all stored credentials? You will need to re-enter them.'
            )
        ) {
            localStorage.removeItem('adminSecureSettings');
            localStorage.removeItem('processedSubmissions');
            localStorage.removeItem('submissionStatus');
            localStorage.removeItem('rejectionReasons');

            this.settings = this.loadSecureSettings();
            this.updateUI();

            this.showNotification('All credentials cleared', 'warning');
            this.switchSection('settings');
        }
    }

    // Export data (WITHOUT credentials)
    exportSecureData() {
        const data = {
            approvedProfiles: this.approvedProfiles,
            exportDate: new Date().toISOString(),
            note: 'Credentials not included for security',
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `techwomen-dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Setup event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.switchSection(section);
            });
        });

        // Settings
        document
            .getElementById('save-settings')
            .addEventListener('click', () => {
                this.saveSecureSettings();
            });

        document
            .getElementById('test-connection')
            .addEventListener('click', () => {
                this.testConnection();
            });

        // Add clear credentials button
        const clearBtn = document.createElement('button');
        clearBtn.textContent = '🗑️ Clear All Credentials';
        clearBtn.className = 'btn btn-danger';
        clearBtn.onclick = () => this.clearCredentials();
        document.querySelector('.settings-form').appendChild(clearBtn);

        // Refresh and export
        document
            .getElementById('refresh-data')
            .addEventListener('click', () => {
                this.refreshData();
            });

        document.getElementById('export-data').addEventListener('click', () => {
            this.exportSecureData();
        });
    }

    // Update UI with current settings (but mask sensitive data)
    updateUI() {
        document.getElementById('netlify-token').value =
            this.settings.netlifyToken;
        document.getElementById('form-id').value = this.settings.formId;
        document.getElementById('auto-refresh').value =
            this.settings.autoRefresh;

        // Mask the token in the UI for security
        const tokenInput = document.getElementById('netlify-token');
        if (this.settings.netlifyToken) {
            tokenInput.type = 'password';
            tokenInput.placeholder = '••••••••••••••••';
        }
    }

    // Rest of the methods would be similar to the original dashboard
    // but with security-first approach...

    showNotification(message, type = 'info', duration = 5000) {
        const container =
            document.getElementById('notification-container') || document.body;
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        container.appendChild(notification);
        setTimeout(() => notification.remove(), duration);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showLoading(show) {
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.style.display = show ? 'flex' : 'none';
        }
    }

    switchSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach((section) => {
            section.style.display = 'none';
        });

        // Show selected section
        document.getElementById(`${sectionName}-section`).style.display =
            'block';

        // Update navigation
        document.querySelectorAll('.nav-link').forEach((link) => {
            link.classList.remove('active');
        });
        document
            .querySelector(`[data-section="${sectionName}"]`)
            .classList.add('active');

        this.currentSection = sectionName;
    }

    updateSyncStatus(status) {
        // Implementation for sync status updates
    }

    setupAutoRefresh() {
        // Implementation for auto-refresh
    }

    async loadInitialData() {
        if (this.settings.netlifyToken && this.settings.formId) {
            await this.loadSubmissions();
        }
    }

    renderPendingSubmissions() {
        // Implementation for rendering submissions
    }

    isProcessed(submissionId) {
        const processed = JSON.parse(
            localStorage.getItem('processedSubmissions') || '[]'
        );
        return processed.includes(submissionId);
    }

    async refreshData() {
        await this.loadSubmissions();
        this.showNotification('Data refreshed', 'success');
    }
}

// Initialize secure dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new SecureAdminDashboard();
});
