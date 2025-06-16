/**
 * TechWomen Moldova - Complete Data Display System
 * Loads JSON data and renders mentor cards, mentee cards, and testimonial stickies
 */

class TechWomenDataDisplay {
    constructor() {
        this.mentors = [];
        this.mentees = [];
        this.testimonials = [];
        this.gallery = [];
        this.isLoading = false;

        this.init();
    }

    // Initialize the display system
    async init() {
        await this.loadAllData();
        this.renderCurrentPage();
        this.setupEventListeners();
    }

    // Load all JSON data files
    async loadAllData() {
        this.isLoading = true;
        this.showLoadingState();

        try {
            const [
                mentorsResponse,
                menteesResponse,
                testimonialsResponse,
                galleryResponse,
            ] = await Promise.all([
                fetch('/data/mentors.json'),
                fetch('/data/mentees.json'),
                fetch('/data/testimonials.json'),
                fetch('/data/gallery.json'),
            ]);

            // Handle failed requests gracefully
            this.mentors = mentorsResponse.ok
                ? await mentorsResponse.json()
                : [];
            this.mentees = menteesResponse.ok
                ? await menteesResponse.json()
                : [];
            this.testimonials = testimonialsResponse.ok
                ? await testimonialsResponse.json()
                : [];
            this.gallery = galleryResponse.ok
                ? await galleryResponse.json()
                : [];

            console.log('✅ Data loaded:', {
                mentors: this.mentors.length,
                mentees: this.mentees.length,
                testimonials: this.testimonials.length,
                gallery: this.gallery.length,
            });
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.showErrorState('Failed to load profile data');
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    // Determine what to render based on current page
    renderCurrentPage() {
        const currentPage =
            window.location.pathname.split('/').pop() || 'index.html';

        switch (currentPage) {
            case 'mentors.html':
                this.renderMentorsPage();
                break;
            case 'mentees.html':
                this.renderMenteesPage();
                break;
            case 'testimonials.html':
                this.renderTestimonialsPage();
                break;
            case 'gallery.html':
                this.renderGalleryPage();
                break;
            case 'index.html':
            case '':
                this.renderHomepageFeatures();
                break;
        }
    }

    // ============================================================================
    // MENTOR CARDS RENDERING
    // ============================================================================

    renderMentorsPage() {
        const container = document.getElementById('mentors-container');
        if (!container) return;

        if (this.mentors.length === 0) {
            container.innerHTML = this.getEmptyState(
                'mentors',
                'No mentors found',
                'Be the first to join as a mentor!'
            );
            return;
        }

        container.innerHTML = `
            <div class="results-header">
                <h2>Our Amazing Mentors</h2>
                <p>Meet ${this.mentors.length} experienced professionals guiding the next generation</p>
            </div>
            <div class="profiles-grid">
                ${this.mentors.map((mentor) => this.createMentorCard(mentor)).join('')}
            </div>
        `;

        this.setupCardInteractions();
    }

    createMentorCard(mentor) {
        return `
            <div class="profile-card mentor-card" data-id="${mentor.id}">
                <div class="card-image">
                    <img src="${mentor.image}" alt="${mentor.name}" 
                         onerror="this.src='/assets/images/defaults/profile-placeholder.jpg'"
                         loading="lazy">
                    <div class="card-overlay">
                        <button class="btn btn-primary view-profile" data-id="${mentor.id}" data-type="mentor">
                            View Profile
                        </button>
                    </div>
                </div>
                
                <div class="card-content">
                    <h3 class="profile-name">${mentor.name}</h3>
                    <p class="profile-title">${mentor.title}</p>
                    ${mentor.company ? `<p class="profile-company">${mentor.company}</p>` : ''}
                    
                    <div class="profile-tags">
                        ${mentor.domain ? `<span class="tag domain-tag">${mentor.domain}</span>` : ''}
                        ${mentor.year ? `<span class="tag year-tag">Since ${mentor.year}</span>` : ''}
                    </div>
                    
                    ${mentor.bio ? `<p class="profile-bio">${this.truncateText(mentor.bio, 120)}</p>` : ''}
                    
                    <div class="card-actions">
                        ${mentor.linkedin ? `<a href="${mentor.linkedin}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">LinkedIn</a>` : ''}
                        <button class="btn btn-primary btn-sm view-details" data-id="${mentor.id}" data-type="mentor">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================================
    // MENTEE CARDS RENDERING
    // ============================================================================

    renderMenteesPage() {
        const container = document.getElementById('mentees-container');
        if (!container) return;

        if (this.mentees.length === 0) {
            container.innerHTML = this.getEmptyState(
                'mentees',
                'No success stories yet',
                'Share your journey with us!'
            );
            return;
        }

        container.innerHTML = `
            <div class="results-header">
                <h2>Our Inspiring Mentees</h2>
                <p>Discover ${this.mentees.length} success stories from our community</p>
            </div>
            <div class="profiles-grid">
                ${this.mentees.map((mentee) => this.createMenteeCard(mentee)).join('')}
            </div>
        `;

        this.setupCardInteractions();
    }

    createMenteeCard(mentee) {
        return `
            <div class="profile-card mentee-card" data-id="${mentee.id}">
                <div class="card-image">
                    <img src="${mentee.image}" alt="${mentee.name}" 
                         onerror="this.src='/assets/images/defaults/profile-placeholder.jpg'"
                         loading="lazy">
                    <div class="card-overlay">
                        <button class="btn btn-primary view-profile" data-id="${mentee.id}" data-type="mentee">
                            View Story
                        </button>
                    </div>
                </div>
                
                <div class="card-content">
                    <h3 class="profile-name">${mentee.name}</h3>
                    <p class="profile-title">${mentee.title}</p>
                    ${mentee.company ? `<p class="profile-company">${mentee.company}</p>` : ''}
                    
                    <div class="profile-tags">
                        ${mentee.domain ? `<span class="tag domain-tag">${mentee.domain}</span>` : ''}
                        ${mentee.year ? `<span class="tag year-tag">Class of ${mentee.year}</span>` : ''}
                        ${mentee.mentor ? `<span class="tag mentor-tag">Mentored by ${mentee.mentor}</span>` : ''}
                    </div>
                    
                    ${mentee.story ? `<p class="profile-story">${this.truncateText(mentee.story, 120)}</p>` : ''}
                    
                    <div class="card-actions">
                        ${mentee.linkedin ? `<a href="${mentee.linkedin}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">LinkedIn</a>` : ''}
                        <button class="btn btn-primary btn-sm view-details" data-id="${mentee.id}" data-type="mentee">
                            Read Story
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================================
    // TESTIMONIAL STICKY NOTES RENDERING
    // ============================================================================

    renderTestimonialsPage() {
        const container = document.getElementById('testimonials-container');
        if (!container) return;

        if (this.testimonials.length === 0) {
            container.innerHTML = this.getEmptyState(
                'testimonials',
                'No testimonials yet',
                'Be the first to share your experience!'
            );
            return;
        }

        container.innerHTML = `
            <div class="results-header">
                <h2>Community Stories</h2>
                <p>Read ${this.testimonials.length} testimonials from our amazing community</p>
            </div>
            <div class="testimonials-wall">
                ${this.testimonials.map((testimonial) => this.createTestimonialSticky(testimonial)).join('')}
            </div>
        `;

        this.setupTestimonialInteractions();
    }

    createTestimonialSticky(testimonial) {
        // Different colored sticky notes
        const colors = [
            '#ffeb3b', // Yellow
            '#ff9999', // Pink
            '#99ccff', // Blue
            '#99ff99', // Green
            '#ffcc99', // Orange
            '#cc99ff', // Purple
            '#ffb3e6', // Light Pink
            '#b3d9ff', // Light Blue
            '#b3ffb3', // Light Green
            '#ffe6b3', // Light Orange
        ];

        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const rotation = (Math.random() - 0.5) * 8; // Random rotation between -4 and 4 degrees

        return `
            <div class="testimonial-sticky" 
                 style="background-color: ${randomColor}; transform: rotate(${rotation}deg);"
                 data-id="${testimonial.id}">
                <div class="sticky-content">
                    <div class="testimonial-quote">
                        <p>"${testimonial.message}"</p>
                    </div>
                    
                    <div class="testimonial-author">
                        <div class="author-info">
                            <strong>${testimonial.name}</strong>
                            <div class="author-meta">
                                <span class="role-badge ${testimonial.role}">${testimonial.role}</span>
                                ${testimonial.year ? `<span class="year">${testimonial.year}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                ${
                    testimonial.message && testimonial.message.length > 150
                        ? `
                <div class="sticky-actions">
                    <button class="btn btn-sm expand-testimonial" data-id="${testimonial.id}">
                        Read Full
                    </button>
                </div>
                `
                        : ''
                }
            </div>
        `;
    }

    // ============================================================================
    // HOMEPAGE FEATURES RENDERING
    // ============================================================================

    renderHomepageFeatures() {
        this.renderFeaturedMentors();
        this.renderFeaturedMentees();
        this.renderFeaturedTestimonials();
        this.renderStatsSection();
    }

    renderFeaturedMentors() {
        const container = document.getElementById('featured-mentors');
        if (!container) return;

        const featured = this.mentors.slice(0, 3); // Show first 3 mentors

        if (featured.length === 0) {
            container.innerHTML = '<p>Loading featured mentors...</p>';
            return;
        }

        container.innerHTML = `
            <div class="featured-grid">
                ${featured.map((mentor) => this.createMentorCard(mentor)).join('')}
            </div>
            <div class="featured-action">
                <a href="/mentors.html" class="btn btn-primary">View All ${this.mentors.length} Mentors</a>
            </div>
        `;
    }

    renderFeaturedMentees() {
        const container = document.getElementById('featured-mentees');
        if (!container) return;

        const featured = this.mentees.slice(0, 3); // Show first 3 mentees

        if (featured.length === 0) {
            container.innerHTML = '<p>Loading success stories...</p>';
            return;
        }

        container.innerHTML = `
            <div class="featured-grid">
                ${featured.map((mentee) => this.createMenteeCard(mentee)).join('')}
            </div>
            <div class="featured-action">
                <a href="/mentees.html" class="btn btn-primary">View All ${this.mentees.length} Success Stories</a>
            </div>
        `;
    }

    renderFeaturedTestimonials() {
        const container = document.getElementById('featured-testimonials');
        if (!container) return;

        const featured = this.testimonials
            .filter((t) => t.featured)
            .slice(0, 3);

        if (featured.length === 0) {
            container.innerHTML = '<p>Loading testimonials...</p>';
            return;
        }

        container.innerHTML = `
            <div class="testimonials-mini-wall">
                ${featured.map((testimonial) => this.createTestimonialSticky(testimonial)).join('')}
            </div>
            <div class="featured-action">
                <a href="/testimonials.html" class="btn btn-primary">Read All Stories</a>
            </div>
        `;
    }

    renderStatsSection() {
        const container = document.getElementById('program-stats');
        if (!container) return;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${this.mentors.length}</div>
                    <div class="stat-label">Mentors</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${this.mentees.length}</div>
                    <div class="stat-label">Mentees</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">5</div>
                    <div class="stat-label">Years</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${this.testimonials.length}</div>
                    <div class="stat-label">Success Stories</div>
                </div>
            </div>
        `;
    }

    // ============================================================================
    // GALLERY RENDERING (BONUS)
    // ============================================================================

    renderGalleryPage() {
        const container = document.getElementById('gallery-container');
        if (!container) return;

        if (this.gallery.length === 0) {
            container.innerHTML = this.getEmptyState(
                'gallery',
                'No photos yet',
                'Check back soon for event photos!'
            );
            return;
        }

        // Group photos by year
        const photosByYear = this.gallery.reduce((acc, photo) => {
            if (!acc[photo.year]) acc[photo.year] = [];
            acc[photo.year].push(photo);
            return acc;
        }, {});

        container.innerHTML = `
            <div class="results-header">
                <h2>5 Years of Memories</h2>
                <p>Relive the journey through ${this.gallery.length} photos</p>
            </div>
            ${Object.keys(photosByYear)
                .sort()
                .reverse()
                .map(
                    (year) => `
                <div class="gallery-year-section">
                    <h3>${year}</h3>
                    <div class="gallery-grid">
                        ${photosByYear[year]
                            .map(
                                (photo) => `
                            <div class="gallery-item" data-id="${photo.id}">
                                <img src="${photo.image}" alt="${photo.title}" 
                                     onerror="this.src='/assets/images/defaults/placeholder.jpg'"
                                     loading="lazy">
                                <div class="gallery-overlay">
                                    <h4>${photo.title}</h4>
                                    <p>${photo.description}</p>
                                </div>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                </div>
            `
                )
                .join('')}
        `;
    }

    // ============================================================================
    // INTERACTION HANDLERS
    // ============================================================================

    setupCardInteractions() {
        // Profile detail modals
        document.querySelectorAll('.view-details').forEach((button) => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const type = e.target.dataset.type;
                this.showProfileModal(id, type);
            });
        });

        // Card hover effects
        document.querySelectorAll('.profile-card').forEach((card) => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    setupTestimonialInteractions() {
        // Expand testimonial functionality
        document.querySelectorAll('.expand-testimonial').forEach((button) => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.expandTestimonial(id);
            });
        });

        // Sticky note hover effects
        document.querySelectorAll('.testimonial-sticky').forEach((sticky) => {
            sticky.addEventListener('mouseenter', () => {
                sticky.style.transform = 'rotate(0deg) scale(1.05)';
                sticky.style.zIndex = '10';
            });

            sticky.addEventListener('mouseleave', () => {
                const rotation = (Math.random() - 0.5) * 8;
                sticky.style.transform = `rotate(${rotation}deg) scale(1)`;
                sticky.style.zIndex = '1';
            });
        });
    }

    setupEventListeners() {
        // Refresh data periodically (every 5 minutes)
        setInterval(
            () => {
                this.loadAllData().then(() => {
                    this.renderCurrentPage();
                });
            },
            5 * 60 * 1000
        );

        // Handle window resize for responsive layouts
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    // ============================================================================
    // MODAL AND INTERACTION FUNCTIONS
    // ============================================================================

    showProfileModal(id, type) {
        const data = type === 'mentor' ? this.mentors : this.mentees;
        const profile = data.find((item) => item.id === id);

        if (!profile) return;

        const modal = document.createElement('div');
        modal.className = 'profile-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${profile.name}</h2>
                    <button class="modal-close" onclick="this.closest('.profile-modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="profile-details">
                        <div class="profile-image-section">
                            <img src="${profile.image}" alt="${profile.name}" 
                                 onerror="this.src='/assets/images/defaults/profile-placeholder.jpg'"
                                 class="profile-image-large">
                        </div>
                        <div class="profile-info-section">
                            <h3>${profile.title}</h3>
                            ${profile.company ? `<p class="company">${profile.company}</p>` : ''}
                            <div class="profile-meta">
                                ${profile.domain ? `<span class="meta-tag">${profile.domain}</span>` : ''}
                                ${profile.year ? `<span class="meta-tag">Since ${profile.year}</span>` : ''}
                            </div>
                            ${
                                profile.linkedin
                                    ? `
                                <a href="${profile.linkedin}" target="_blank" rel="noopener" class="btn btn-outline">
                                    View LinkedIn Profile
                                </a>
                            `
                                    : ''
                            }
                        </div>
                    </div>
                    <div class="profile-description">
                        <h4>${type === 'mentor' ? 'About' : 'Success Story'}</h4>
                        <p>${type === 'mentor' ? profile.bio : profile.story}</p>
                        ${profile.mentor ? `<p><strong>Mentored by:</strong> ${profile.mentor}</p>` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Restore body scroll when modal is closed
        const originalRemove = modal.remove;
        modal.remove = function () {
            document.body.style.overflow = '';
            originalRemove.call(this);
        };
    }

    expandTestimonial(id) {
        const testimonial = this.testimonials.find((t) => t.id === id);
        if (!testimonial) return;

        const modal = document.createElement('div');
        modal.className = 'testimonial-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Testimonial from ${testimonial.name}</h3>
                    <button class="modal-close" onclick="this.closest('.testimonial-modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="testimonial-full">
                        <blockquote>
                            "${testimonial.message}"
                        </blockquote>
                        <div class="testimonial-attribution">
                            <strong>${testimonial.name}</strong><br>
                            <span class="role-badge ${testimonial.role}">${testimonial.role}</span>
                            ${testimonial.year ? ` • ${testimonial.year}` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text || '';
        return text.substring(0, maxLength) + '...';
    }

    getEmptyState(type, title, subtitle) {
        return `
            <div class="empty-state">
                <div class="empty-icon">🎯</div>
                <h3>${title}</h3>
                <p>${subtitle}</p>
                <a href="/add-profile.html" class="btn btn-primary">Add Your Profile</a>
            </div>
        `;
    }

    showLoadingState() {
        const containers = [
            'mentors-container',
            'mentees-container',
            'testimonials-container',
            'featured-mentors',
            'featured-mentees',
            'featured-testimonials',
        ];

        containers.forEach((containerId) => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="loading-state">
                        <div class="loading-spinner"></div>
                        <p>Loading amazing profiles...</p>
                    </div>
                `;
            }
        });
    }

    hideLoadingState() {
        // Loading states will be replaced by actual content
    }

    showErrorState(message) {
        const containers = [
            'mentors-container',
            'mentees-container',
            'testimonials-container',
        ];

        containers.forEach((containerId) => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="error-state">
                        <div class="error-icon">⚠️</div>
                        <h3>Oops! Something went wrong</h3>
                        <p>${message}</p>
                        <button onclick="window.location.reload()" class="btn btn-primary">Try Again</button>
                    </div>
                `;
            }
        });
    }

    handleResize() {
        // Handle responsive adjustments if needed
        const testimonialStickies = document.querySelectorAll(
            '.testimonial-sticky'
        );
        if (window.innerWidth < 768) {
            testimonialStickies.forEach((sticky) => {
                sticky.style.transform = 'rotate(0deg)'; // Remove rotation on mobile
            });
        }
    }

    // Public method to refresh data
    async refresh() {
        await this.loadAllData();
        this.renderCurrentPage();
    }
}

// Initialize when DOM is loaded
let techWomenDisplay;
document.addEventListener('DOMContentLoaded', () => {
    techWomenDisplay = new TechWomenDataDisplay();
});

// Export for global access
window.TechWomenDataDisplay = TechWomenDataDisplay;
