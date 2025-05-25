// Main JavaScript for Fades n Braids

document.addEventListener('DOMContentLoaded', function() {
    console.log('Fades n Braids app loaded');
    console.log('Current page:', window.location.pathname);

    // Initialize animations
    initializeAnimations();

    // Initialize dashboard if on dashboard page
    if (document.querySelector('.dashboard-page')) {
        initializeDashboard();
    }

    // Initialize business dashboard if on business dashboard
    if (document.querySelector('.business-dashboard')) {
        initializeBusinessDashboard();
    }

    // Initialize check-in codes page
    if (document.querySelector('.checkin-codes-page')) {
        initializeCheckInCodes();
    }

    // Initialize page-specific animations
    initializePageAnimations();

    // Handle logout forms
    const logoutForms = document.querySelectorAll('.logout-form');
    logoutForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            fetch(this.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/';
                } else {
                    console.error('Logout failed:', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });

    // Handle authentication forms
    const authForms = document.querySelectorAll('.auth-form');
    authForms.forEach(form => {
        form.addEventListener('submit', handleAuthFormSubmit);

        // Add real-time validation
        const inputs = form.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', clearValidationErrors);
        });
    });

    // Form validation helpers
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const inputs = form.querySelectorAll('input[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });

            if (!isValid) {
                e.preventDefault();
            }
        });
    });

    // Handle check-in form
    const checkinForm = document.getElementById('checkin-form');
    if (checkinForm) {
        checkinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCheckIn();
        });
    }
});

// Authentication Form Handler
function handleAuthFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    // Clear any existing error states
    form.querySelectorAll('.form-input.error').forEach(input => {
        input.classList.remove('error');
    });

    // Add loading state to form
    form.classList.add('loading');

    // Disable submit button and show loading
    submitButton.disabled = true;
    submitButton.innerHTML = '<div class="loading-spinner"></div> Processing...';

    // Convert FormData to JSON
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Submit form
    fetch(form.action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        // Remove loading state
        form.classList.remove('loading');

        if (result.success) {
            // Add success state
            form.classList.add('success');

            // Show success message
            showNotification(result.message, 'success');

            // Add success state to all inputs
            form.querySelectorAll('.form-input').forEach(input => {
                input.classList.add('success');
            });

            // Update button to show success
            submitButton.innerHTML = '✅ Success! Redirecting...';

            // Determine redirect URL based on form action
            let redirectUrl = '/customer/dashboard';
            if (form.action.includes('/business/')) {
                redirectUrl = '/business/dashboard';
            }

            // Redirect after a short delay to show the success message
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);
        } else {
            // Show error message
            showNotification(result.message || 'Authentication failed', 'error');

            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;

            // Highlight form errors if any
            if (result.errors) {
                result.errors.forEach(error => {
                    const field = form.querySelector(`[name="${error.param}"]`);
                    if (field) {
                        field.classList.add('error');
                        field.addEventListener('input', () => {
                            field.classList.remove('error');
                        }, { once: true });
                    }
                });
            } else {
                // If no specific field errors, highlight all required fields
                form.querySelectorAll('input[required]').forEach(input => {
                    input.classList.add('error');
                    input.addEventListener('input', () => {
                        input.classList.remove('error');
                    }, { once: true });
                });
            }
        }
    })
    .catch(error => {
        console.error('Authentication error:', error);

        // Remove loading state
        form.classList.remove('loading');

        showNotification('Network error. Please try again.', 'error');

        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;

        // Highlight all inputs as error for network issues
        form.querySelectorAll('.form-input').forEach(input => {
            input.classList.add('error');
            input.addEventListener('input', () => {
                input.classList.remove('error');
            }, { once: true });
        });
    });
}

// Form Validation Functions
function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();

    // Clear previous states
    input.classList.remove('error', 'success');

    // Skip validation if empty (unless required)
    if (!value && !input.required) return;

    let isValid = true;

    // Required field validation
    if (input.required && !value) {
        isValid = false;
    }

    // Type-specific validation
    switch (input.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                isValid = false;
            }
            break;

        case 'tel':
            // Basic phone validation (at least 10 digits)
            const phoneRegex = /\d{10,}/;
            if (value && !phoneRegex.test(value.replace(/\D/g, ''))) {
                isValid = false;
            }
            break;

        case 'password':
            if (value && value.length < 6) {
                isValid = false;
            }
            break;
    }

    // Apply validation state
    if (value) {
        input.classList.add(isValid ? 'success' : 'error');
    }
}

function clearValidationErrors(e) {
    const input = e.target;
    input.classList.remove('error');
}

// Customer Dashboard Functions
function initializeDashboard() {
    loadRecentActivity();
    loadRewards();
}

function loadRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;

    fetch('/api/customers/visits?limit=5')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayRecentActivity(data.data.visits);
            } else {
                container.innerHTML = '<p class="text-center">No recent activity</p>';
            }
        })
        .catch(error => {
            console.error('Error loading recent activity:', error);
            container.innerHTML = '<p class="text-center">Error loading activity</p>';
        });
}

function displayRecentActivity(visits) {
    const container = document.getElementById('recent-activity');
    if (!visits || visits.length === 0) {
        container.innerHTML = '<p class="text-center">No recent visits</p>';
        return;
    }

    const html = visits.map(visit => `
        <div class="activity-item">
            <div class="activity-icon">✓</div>
            <div class="activity-content">
                <div class="activity-title">Check-in completed</div>
                <div class="activity-date">${formatDate(visit.visitDate)}</div>
            </div>
            <div class="activity-points">+${visit.pointsEarned}</div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function loadRewards() {
    const container = document.getElementById('rewards-grid');
    if (!container) return;

    fetch('/api/customers/rewards')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayRewards(data.data.rewards);
            } else {
                container.innerHTML = '<p class="text-center">No rewards available</p>';
            }
        })
        .catch(error => {
            console.error('Error loading rewards:', error);
            container.innerHTML = '<p class="text-center">Error loading rewards</p>';
        });
}

function displayRewards(rewards) {
    const container = document.getElementById('rewards-grid');
    if (!rewards || rewards.length === 0) {
        container.innerHTML = '<p class="text-center">No rewards available</p>';
        return;
    }

    const html = rewards.map(reward => `
        <div class="reward-card">
            <div class="reward-header">
                <span class="reward-category">${reward.category.replace('_', ' ')}</span>
                <span class="reward-points">${reward.pointsRequired} pts</span>
            </div>
            <h3 class="reward-title">${reward.title}</h3>
            <p class="reward-description">${reward.description}</p>
            <div class="reward-value">${reward.value}</div>
            <button class="btn btn-primary btn-full" onclick="redeemReward('${reward._id}')">
                Redeem Now
            </button>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Business Dashboard Functions
function initializeBusinessDashboard() {
    loadDashboardStats();
    loadCurrentCodes();
}

function loadDashboardStats() {
    fetch('/api/business/dashboard')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateStats(data.data.stats);
                displayRecentVisits(data.data.recentVisits);
                displayTopCustomers(data.data.topCustomers);
            }
        })
        .catch(error => {
            console.error('Error loading dashboard stats:', error);
        });
}

function updateStats(stats) {
    const elements = {
        'total-customers': stats.totalCustomers || 0,
        'today-visits': stats.todayVisits || 0,
        'total-visits': stats.totalVisits || 0,
        'active-rewards': stats.activeRewards || 0
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            // Ensure value is a number and not NaN
            const numValue = Number(value) || 0;
            element.textContent = numValue.toLocaleString();
        }
    });
}

function loadCurrentCodes() {
    fetch('/api/business/codes')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateCodes(data.data);
            }
        })
        .catch(error => {
            console.error('Error loading codes:', error);
        });
}

function updateCodes(codeData) {
    const qrImage = document.getElementById('qr-image');
    const qrLoading = document.getElementById('qr-loading');
    const digitCode = document.getElementById('digit-code');
    const codeExpiry = document.getElementById('code-expiry');

    if (qrImage && codeData.qrCodeImage) {
        qrImage.src = codeData.qrCodeImage;
        qrImage.style.display = 'block';
        if (qrLoading) qrLoading.style.display = 'none';
    }

    if (digitCode) {
        digitCode.textContent = codeData.digitCode;
    }

    if (codeExpiry && codeData.expiresAt) {
        const expiry = new Date(codeData.expiresAt);
        codeExpiry.textContent = expiry.toLocaleTimeString();
    }
}

function displayRecentVisits(visits) {
    const container = document.getElementById('recent-visits');
    if (!container) return;

    if (!visits || visits.length === 0) {
        container.innerHTML = '<p class="text-center">No recent visits</p>';
        return;
    }

    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Date</th>
                    <th>Points</th>
                </tr>
            </thead>
            <tbody>
                ${visits.map(visit => `
                    <tr>
                        <td>${visit.customer ? `${visit.customer.firstName} ${visit.customer.lastName}` : 'Unknown'}</td>
                        <td>${visit.customer ? visit.customer.phone : 'N/A'}</td>
                        <td>${formatDate(visit.visitDate)}</td>
                        <td class="points-cell">+${visit.pointsEarned}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

function displayTopCustomers(customers) {
    const container = document.getElementById('top-customers');
    if (!container) return;

    if (!customers || customers.length === 0) {
        container.innerHTML = '<p class="text-center">No customers found</p>';
        return;
    }

    const html = customers.map((customer, index) => `
        <div class="customer-card">
            <div class="customer-rank">#${index + 1}</div>
            <div class="customer-info">
                <div class="customer-name">${customer.firstName} ${customer.lastName}</div>
                <div class="customer-phone">${customer.phone}</div>
            </div>
            <div class="customer-stats">
                <div class="stat">
                    <span class="stat-value">${customer.totalPoints.toLocaleString()}</span>
                    <span class="stat-label">Points</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${customer.totalVisits}</span>
                    <span class="stat-label">Visits</span>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Check-in Codes Page Functions
function initializeCheckInCodes() {
    loadCurrentCodes();
    startCountdown();

    // Refresh codes every 5 minutes
    setInterval(() => {
        loadCurrentCodes();
        startCountdown();
    }, 5 * 60 * 1000);
}

function startCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    let timeLeft = 5 * 60; // 5 minutes in seconds

    const timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timer);
            countdownElement.textContent = 'Refreshing...';
        }
    }, 1000);
}

// Modal Functions
function showCheckInModal() {
    const modal = document.getElementById('checkin-modal');
    if (modal) {
        modal.classList.add('show');
        document.getElementById('checkin-code').focus();
    }
}

function closeCheckInModal() {
    const modal = document.getElementById('checkin-modal');
    if (modal) {
        modal.classList.remove('show');
        document.getElementById('checkin-form').reset();
    }
}

function handleCheckIn() {
    const code = document.getElementById('checkin-code').value.trim();
    if (!code) return;

    fetch('/api/customers/checkin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            closeCheckInModal();
            // Refresh the page to update points
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showNotification(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Check-in error:', error);
        showNotification('Check-in failed. Please try again.', 'error');
    });
}

function redeemReward(rewardId) {
    if (!confirm('Are you sure you want to redeem this reward?')) return;

    fetch(`/api/customers/rewards/${rewardId}/redeem`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            // Refresh rewards and points
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showNotification(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Redeem error:', error);
        showNotification('Redemption failed. Please try again.', 'error');
    });
}

// Additional functions referenced in templates
function showVisitHistory() {
    showNotification('Visit history feature coming soon!', 'info');
}

function showProfile() {
    showNotification('Profile editing feature coming soon!', 'info');
}

// Business modal functions - implemented in business-modals.js
function showCustomersModal() {
    if (typeof createCustomersModal === 'function') {
        createCustomersModal();
    } else {
        showNotification('Customer management feature loading...', 'info');
    }
}

function showRewardsModal() {
    if (typeof createRewardsModal === 'function') {
        createRewardsModal();
    } else {
        showNotification('Rewards management feature loading...', 'info');
    }
}

function showAwardPointsModal() {
    if (typeof createAwardPointsModal === 'function') {
        createAwardPointsModal();
    } else {
        showNotification('Award points feature loading...', 'info');
    }
}

function showAnalytics() {
    if (typeof createAnalyticsModal === 'function') {
        createAnalyticsModal();
    } else {
        showNotification('Analytics feature loading...', 'info');
    }
}

function refreshCodes() {
    loadCurrentCodes();
    showNotification('Codes refreshed!', 'success');
}

// Utility functions
function formatPoints(points) {
    return points.toLocaleString();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
    `;

    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            openModal.classList.remove('show');
        }
    }
});

// Animation and Enhancement Functions
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationType = element.dataset.animate;
                const delay = element.dataset.delay || 0;

                setTimeout(() => {
                    switch (animationType) {
                        case 'slide-up':
                            element.classList.add('fade-in-up');
                            break;
                        case 'fade-in':
                            element.classList.add('fade-in-up');
                            break;
                        case 'counter':
                            animateCounter(element);
                            break;
                        default:
                            element.classList.add('fade-in-up');
                    }
                }, delay);

                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Observe all elements with animation attributes
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });
}

function initializePageAnimations() {
    // Add stagger animation to lists
    const lists = document.querySelectorAll('.benefits-grid > *, .steps > *, .quick-actions-grid > *');
    lists.forEach((item, index) => {
        item.classList.add('stagger-item');
        item.style.animationDelay = `${index * 0.1}s`;
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.dashboard-card, .stat-card, .benefit-card');
    cards.forEach(card => {
        card.classList.add('hover-lift');
    });

    // Add shimmer effect to loading elements
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => {
        el.classList.add('shimmer');
    });
}

function animateCounter(element) {
    const target = parseInt(element.textContent.replace(/,/g, ''));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Enhanced scroll functions
function scrollToRewards() {
    const rewardsSection = document.getElementById('rewards');
    if (rewardsSection) {
        rewardsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        // Add highlight animation
        rewardsSection.classList.add('highlight-section');
        setTimeout(() => {
            rewardsSection.classList.remove('highlight-section');
        }, 2000);
    }
}

// Enhanced modal functions
function showCheckInModal() {
    const modal = document.getElementById('checkin-modal');
    if (modal) {
        modal.classList.add('show');
        modal.querySelector('.modal-content').classList.add('scale-in');
        document.getElementById('checkin-code').focus();

        // Add backdrop blur
        document.body.style.overflow = 'hidden';
    }
}

function closeCheckInModal() {
    const modal = document.getElementById('checkin-modal');
    if (modal) {
        modal.querySelector('.modal-content').classList.add('scale-out');
        setTimeout(() => {
            modal.classList.remove('show');
            modal.querySelector('.modal-content').classList.remove('scale-in', 'scale-out');
            document.getElementById('checkin-form').reset();
            document.body.style.overflow = '';
        }, 300);
    }
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    // Add icon based on type
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-message">${message}</span>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        color: white;
        font-weight: 500;
        z-index: 9999;
        max-width: 350px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;

    const colors = {
        success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    };
    notification.style.background = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.classList.add('show');
    }, 100);

    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 5000);

    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    });
}

// Enhanced loading states
function showLoading(container, message = 'Loading...') {
    const loadingHTML = `
        <div class="loading enhanced-loading">
            <div class="loading-spinner"></div>
            <span>${message}</span>
        </div>
    `;
    container.innerHTML = loadingHTML;
    container.querySelector('.loading').classList.add('fade-in');
}

// Utility functions for enhanced UX
function addRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple effect to buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
        const button = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
        addRippleEffect(button, e);
    }
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .highlight-section {
        animation: highlight 2s ease-out;
    }

    @keyframes highlight {
        0% { background-color: rgba(238, 117, 42, 0.1); }
        100% { background-color: transparent; }
    }

    .enhanced-loading {
        animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
`;
document.head.appendChild(style);
