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
            this.updateCounts();
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

            // Use submissions endpoint instead of form endpoint
            const response = await fetch(
                `https://api.netlify.com/api/v1/forms/${formId}/submissions`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const submissions = await response.json();
                this.showNotification(
                    `✅ Connection successful! Found ${submissions.length} submissions`,
                    'success'
                );
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
            processedSubmissions: JSON.parse(
                localStorage.getItem('processedSubmissions') || '[]'
            ),
            submissionStatus: JSON.parse(
                localStorage.getItem('submissionStatus') || '{}'
            ),
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
            ?.addEventListener('click', () => {
                this.saveSecureSettings();
            });

        document
            .getElementById('test-connection')
            ?.addEventListener('click', () => {
                this.testConnection();
            });

        // Refresh and export
        document
            .getElementById('refresh-data')
            ?.addEventListener('click', () => {
                this.refreshData();
            });

        document
            .getElementById('export-data')
            ?.addEventListener('click', () => {
                this.exportSecureData();
            });

        // Add clear credentials button to settings form
        const settingsForm = document.querySelector('.settings-form');
        if (settingsForm && !document.getElementById('clear-credentials-btn')) {
            const clearBtn = document.createElement('button');
            clearBtn.id = 'clear-credentials-btn';
            clearBtn.textContent = '🗑️ Clear All Credentials';
            clearBtn.className = 'btn btn-danger';
            clearBtn.type = 'button';
            clearBtn.style.marginTop = '1rem';
            clearBtn.onclick = () => this.clearCredentials();
            settingsForm.appendChild(clearBtn);
        }
    }

    // Update UI with current settings (but mask sensitive data)
    updateUI() {
        const tokenInput = document.getElementById('netlify-token');
        const formIdInput = document.getElementById('form-id');
        const autoRefreshInput = document.getElementById('auto-refresh');

        if (tokenInput) {
            tokenInput.value = this.settings.netlifyToken;
            // Mask the token in the UI for security
            if (this.settings.netlifyToken) {
                tokenInput.type = 'password';
                tokenInput.placeholder = '••••••••••••••••';
            }
        }

        if (formIdInput) {
            formIdInput.value = this.settings.formId;
        }

        if (autoRefreshInput) {
            autoRefreshInput.value = this.settings.autoRefresh;
        }
    }

    // Approve submission function
    async approveSubmission(submissionId) {
        const submission = this.submissions.find((s) => s.id === submissionId);
        if (!submission) {
            this.showNotification('Submission not found', 'error');
            return;
        }

        try {
            // Create profile object from submission
            const profile = this.createProfileFromSubmission(submission);

            // Mark as processed locally
            this.markAsProcessed(submissionId, 'approved');

            // Remove from pending submissions
            this.submissions = this.submissions.filter(
                (s) => s.id !== submissionId
            );

            // Re-render the submissions
            this.renderPendingSubmissions();
            this.updateCounts();

            this.showNotification(
                `${submission.data.name} approved! Check console for JSON`,
                'success'
            );

            // Log the approved profile for manual copying
            console.log('📋 APPROVED PROFILE - Copy this to your JSON file:');
            console.log('='.repeat(60));
            console.log(JSON.stringify(profile, null, 2));
            console.log('='.repeat(60));
        } catch (error) {
            console.error('Error approving submission:', error);
            this.showNotification('Error approving submission', 'error');
        }
    }

    // Reject submission function
    rejectSubmission(submissionId, reason = '') {
        const submission = this.submissions.find((s) => s.id === submissionId);
        if (!submission) {
            this.showNotification('Submission not found', 'error');
            return;
        }

        // If no reason provided, ask for one
        if (!reason) {
            reason =
                prompt('Reason for rejection (optional):') ||
                'No reason provided';
        }

        // Mark as processed with rejection reason
        this.markAsProcessed(submissionId, 'rejected');

        // Store rejection reason
        const rejectionReasons = JSON.parse(
            localStorage.getItem('rejectionReasons') || '{}'
        );
        rejectionReasons[submissionId] = reason;
        localStorage.setItem(
            'rejectionReasons',
            JSON.stringify(rejectionReasons)
        );

        // Remove from pending submissions
        this.submissions = this.submissions.filter(
            (s) => s.id !== submissionId
        );

        // Re-render
        this.renderPendingSubmissions();
        this.updateCounts();

        this.showNotification(
            `Submission from ${submission.data.name} rejected`,
            'warning'
        );
        console.log(`❌ REJECTED: ${submission.data.name} - Reason: ${reason}`);
    }

    // View submission details function
    viewSubmission(submissionId) {
        const submission = this.submissions.find((s) => s.id === submissionId);
        if (!submission) return;

        // Create modal HTML
        const modalHTML = `
            <div id="submission-modal" class="modal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; align-items: center; justify-content: center;">
                <div class="modal-content" style="background: white; border-radius: 12px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 2px solid #dee2e6;">
                        <h3 style="margin: 0; color: #2c3e50;">Submission Details</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6c757d;">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 1.5rem;">
                        <div class="submission-full-details">
                            <div class="detail-section" style="margin-bottom: 1.5rem;">
                                <h4 style="color: #2c3e50; margin-bottom: 0.5rem;">Contact Information</h4>
                                <p><strong>Name:</strong> ${submission.data.name || 'Not provided'}</p>
                                <p><strong>Email:</strong> ${submission.data.email || 'Not provided'}</p>
                            </div>
                            
                            ${
                                submission.data.role
                                    ? `
                            <div class="detail-section" style="margin-bottom: 1.5rem;">
                                <h4 style="color: #2c3e50; margin-bottom: 0.5rem;">Role Information</h4>
                                <p><strong>Role:</strong> ${submission.data.role}</p>
                                <p><strong>Title:</strong> ${submission.data.title || 'Not provided'}</p>
                                <p><strong>Company:</strong> ${submission.data.company || 'Not provided'}</p>
                                <p><strong>Domain:</strong> ${submission.data.domain || 'Not provided'}</p>
                            </div>
                            `
                                    : ''
                            }
                            
                            ${
                                submission.data.bio || submission.data.message
                                    ? `
                            <div class="detail-section" style="margin-bottom: 1.5rem;">
                                <h4 style="color: #2c3e50; margin-bottom: 0.5rem;">${submission.data.bio ? 'Bio/Story' : 'Message'}</h4>
                                <p style="background: #f8f9fa; padding: 1rem; border-radius: 6px; white-space: pre-wrap;">${submission.data.bio || submission.data.message}</p>
                            </div>
                            `
                                    : ''
                            }
                            
                            <div class="detail-section" style="margin-bottom: 1.5rem;">
                                <h4 style="color: #2c3e50; margin-bottom: 0.5rem;">Submission Info</h4>
                                <p><strong>Submitted:</strong> ${new Date(submission.created_at).toLocaleString()}</p>
                                <p><strong>Submission ID:</strong> ${submission.id}</p>
                                <p><strong>Form Name:</strong> ${submission.form_name}</p>
                                ${submission.data.user_agent ? `<p><strong>Browser:</strong> ${submission.data.user_agent}</p>` : ''}
                                ${submission.data.referrer ? `<p><strong>Referred from:</strong> ${submission.data.referrer}</p>` : ''}
                            </div>
                        </div>
                        
                        <div class="modal-actions" style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                            <button class="btn btn-success" onclick="adminDashboard.approveSubmission('${submissionId}'); this.closest('.modal').remove();" style="flex: 1; padding: 0.75rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                ✅ Approve
                            </button>
                            <button class="btn btn-danger" onclick="adminDashboard.rejectSubmission('${submissionId}'); this.closest('.modal').remove();" style="flex: 1; padding: 0.75rem; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                ❌ Reject
                            </button>
                            <button class="btn btn-outline" onclick="this.closest('.modal').remove();" style="flex: 1; padding: 0.75rem; background: transparent; color: #6c757d; border: 2px solid #6c757d; border-radius: 6px; cursor: pointer;">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('submission-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Close modal when clicking outside
        document
            .getElementById('submission-modal')
            .addEventListener('click', function (e) {
                if (e.target === this) {
                    this.remove();
                }
            });
    }

    // Create profile object from submission
    createProfileFromSubmission(submission) {
        const data = submission.data;

        // Determine if this should be a mentor or mentee based on available data
        const role = data.role || 'contact';

        return {
            id: `${role}-${Date.now()}`,
            name: data.name || '',
            title: data.title || 'Community Member',
            company: data.company || '',
            year: data.year || new Date().getFullYear().toString(),
            domain: data.domain || 'General',
            linkedin: data.linkedin || '',
            email: data.email || '',
            bio: data.bio || data.message || '',
            story: data.story || data.message || '', // for mentees
            mentor: data.mentor || '', // for mentees
            image:
                data.image || '/assets/images/defaults/profile-placeholder.jpg',
            status: 'approved',
            dateAdded: new Date().toISOString().split('T')[0],
            submissionId: submission.id,
            submittedAt: submission.created_at,
        };
    }

    // Mark submission as processed
    markAsProcessed(submissionId, status = 'approved') {
        const processed = JSON.parse(
            localStorage.getItem('processedSubmissions') || '[]'
        );
        if (!processed.includes(submissionId)) {
            processed.push(submissionId);
            localStorage.setItem(
                'processedSubmissions',
                JSON.stringify(processed)
            );
        }

        // Store the status and timestamp
        const submissionStatus = JSON.parse(
            localStorage.getItem('submissionStatus') || '{}'
        );
        submissionStatus[submissionId] = {
            status,
            timestamp: new Date().toISOString(),
            processedBy: 'admin',
        };
        localStorage.setItem(
            'submissionStatus',
            JSON.stringify(submissionStatus)
        );
    }

    // Check if submission has been processed
    isProcessed(submissionId) {
        const processed = JSON.parse(
            localStorage.getItem('processedSubmissions') || '[]'
        );
        return processed.includes(submissionId);
    }

    // Update counts in navigation
    updateCounts() {
        const pendingCount = this.submissions.length;
        const submissionStatus = JSON.parse(
            localStorage.getItem('submissionStatus') || '{}'
        );
        const approved = Object.values(submissionStatus).filter(
            (s) => s.status === 'approved'
        ).length;
        const rejected = Object.values(submissionStatus).filter(
            (s) => s.status === 'rejected'
        ).length;

        const pendingElement = document.getElementById('pending-count');
        const approvedElement = document.getElementById('approved-count');
        const rejectedElement = document.getElementById('rejected-count');

        if (pendingElement) pendingElement.textContent = pendingCount;
        if (approvedElement) approvedElement.textContent = approved;
        if (rejectedElement) rejectedElement.textContent = rejected;
    }

    // Load approved profiles from JSON files
    async loadApprovedProfiles() {
        try {
            const [mentorsResponse, menteesResponse] = await Promise.all([
                fetch('/data/mentors.json'),
                fetch('/data/mentees.json'),
            ]);

            this.approvedProfiles = {
                mentors: await mentorsResponse.json(),
                mentees: await menteesResponse.json(),
            };
        } catch (error) {
            console.error('Error loading approved profiles:', error);
            this.approvedProfiles = { mentors: [], mentees: [] };
        }
    }

    // Refresh data function
    async refreshData() {
        this.showNotification('Refreshing data...', 'info');
        await this.loadSubmissions();
        await this.loadApprovedProfiles();
        this.updateCounts();
        this.showNotification('Data refreshed successfully', 'success');
    }

    // Setup auto-refresh
    setupAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        if (this.settings.autoRefresh && this.settings.autoRefresh > 0) {
            this.refreshInterval = setInterval(() => {
                this.refreshData();
            }, this.settings.autoRefresh * 1000);
        }
    }

    // Load initial data
    async loadInitialData() {
        if (this.settings.netlifyToken && this.settings.formId) {
            await this.loadSubmissions();
            await this.loadApprovedProfiles();
            this.updateCounts();
        }
    }

    // Render pending submissions
    renderPendingSubmissions() {
        const container = document.getElementById('pending-submissions');

        if (!container) {
            console.warn('pending-submissions container not found');
            return;
        }

        if (this.submissions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>🎉 All caught up!</h3>
                    <p>No pending submissions to review.</p>
                    <button onclick="adminDashboard.refreshData()" class="btn btn-primary">Check for New Submissions</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.submissions
            .map((submission) => {
                const data = submission.data;
                const createdDate = new Date(
                    submission.created_at
                ).toLocaleDateString();

                return `
                    <div class="submission-card" data-id="${submission.id}">
                        <div class="submission-header">
                            <h3>${data.name || 'Unnamed Submission'}</h3>
                            <div class="submission-meta">
                                <span class="role-badge ${data.role || 'unknown'}">${data.role || 'Contact Form'}</span>
                                <span class="date">${createdDate}</span>
                            </div>
                        </div>
                        
                        <div class="submission-details">
                            <p><strong>Email:</strong> ${data.email || 'Not provided'}</p>
                            ${data.title ? `<p><strong>Title:</strong> ${data.title}</p>` : ''}
                            ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ''}
                            <p><strong>Message:</strong> ${data.message ? data.message.substring(0, 150) + (data.message.length > 150 ? '...' : '') : 'No message'}</p>
                            <p><strong>Submitted:</strong> ${createdDate}</p>
                        </div>

                        <div class="submission-actions">
                            <button class="btn btn-success" onclick="adminDashboard.approveSubmission('${submission.id}')">
                                ✅ Approve
                            </button>
                            <button class="btn btn-danger" onclick="adminDashboard.rejectSubmission('${submission.id}')">
                                ❌ Reject
                            </button>
                            <button class="btn btn-outline" onclick="adminDashboard.viewSubmission('${submission.id}')">
                                👀 View Details
                            </button>
                        </div>
                    </div>
                `;
            })
            .join('');
    }

    // Show notification function
    showNotification(message, type = 'info', duration = 5000) {
        const container =
            document.getElementById('notification-container') || document.body;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 3000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;

        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; font-size: 1.2em; cursor: pointer; margin-left: 10px; float: right;">&times;</button>
        `;

        container.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
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
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach((link) => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(
            `[data-section="${sectionName}"]`
        );
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentSection = sectionName;

        // Update page title
        const titles = {
            pending: 'Pending Submissions',
            approved: 'Approved Profiles',
            rejected: 'Rejected Submissions',
            analytics: 'Submission Analytics',
            settings: 'Dashboard Settings',
        };

        const titleElement = document.getElementById('section-title');
        if (titleElement && titles[sectionName]) {
            titleElement.textContent = titles[sectionName];
        }
    }

    updateSyncStatus(status) {
        const indicator = document.getElementById('sync-indicator');
        const lastSync = document.getElementById('last-sync');

        if (indicator) {
            indicator.className = `sync-indicator ${status}`;
        }

        if (lastSync) {
            lastSync.textContent = `Last sync: ${new Date().toLocaleTimeString()}`;
        }
    }
}

// Initialize secure dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new SecureAdminDashboard();

    // Add CSS for notifications if not already present
    if (!document.getElementById('admin-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'admin-notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// Export for global access
window.AdminDashboard = SecureAdminDashboard;
