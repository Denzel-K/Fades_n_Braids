// Customer Dashboard Functions for Fades n Braids

// Initialize customer dashboard
function initializeDashboard() {
    loadRecentActivity();
    loadRewardCriteria();
    loadRewardsPreview();
    initializeRewards();
    initializeCheckInModal();
    initializeDashboardTabs();
}

// Initialize dashboard tabs
function initializeDashboardTabs() {
    const tabButtons = document.querySelectorAll('.dashboard-tabs .tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchDashboardTab(tabName);
        });
    });

    // Load default tab content
    const activeTab = document.querySelector('.dashboard-tabs .tab-btn.active');
    if (activeTab) {
        switchDashboardTab(activeTab.dataset.tab);
    }
}

// Switch dashboard tabs
function switchDashboardTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.dashboard-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.dashboard-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-content`).classList.add('active');

    // Load tab-specific content
    switch(tabName) {
        case 'overview':
            loadDashboardOverview();
            break;
        case 'rewards':
            Rewards.loadRewards();
            break;
        case 'activity':
            loadDetailedActivity();
            break;
        case 'profile':
            loadProfileSettings();
            break;
    }
}

// Load dashboard overview
function loadDashboardOverview() {
    loadRecentActivity();
    loadQuickStats();
}

// Load recent activity
function loadRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;

    Utils.showLoading(container, 'Loading recent activity...');

    Utils.apiRequest('/api/customers/visits?limit=5')
        .then(data => {
            if (data.success) {
                displayRecentActivity(data.data.visits);
            } else {
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-history"></i></div><div class="empty-state-title">No recent activity</div><div class="empty-state-description">Start checking in to see your activity here!</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading recent activity:', error);
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-state-title">Error loading activity</div><div class="empty-state-description">Please try again later.</div></div>';
        });
}

// Display recent activity with modern styling
function displayRecentActivity(visits) {
    const container = document.getElementById('recent-activity');
    if (!visits || visits.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-history text-gray-400 text-2xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No recent visits</h3>
                <p class="text-gray-600">Check in at the salon to start earning points!</p>
            </div>
        `;
        return;
    }

    const html = visits.map(visit => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" data-animate="fade-in">
            <div class="flex items-center">
                <div class="w-10 h-10 bg-primary-green/20 rounded-full flex items-center justify-center mr-3">
                    <i class="fas fa-check-circle text-primary-green"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-900">Salon Visit</p>
                    <p class="text-sm text-gray-500 flex items-center">
                        <i class="fas fa-clock mr-1"></i>
                        ${formatTimeAgo(visit.visitDate)}
                    </p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold text-primary-orange">+${visit.pointsEarned}</p>
                <p class="text-xs text-gray-500">points</p>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
    if (typeof Animations !== 'undefined') {
        Animations.initializeAnimations();
    }
}

// Load detailed activity for activity tab
function loadDetailedActivity() {
    const container = document.getElementById('detailed-activity');
    if (!container) return;

    Utils.showLoading(container, 'Loading activity history...');

    Utils.apiRequest('/api/customers/visits')
        .then(data => {
            if (data.success) {
                displayDetailedActivity(data.data.visits);
            } else {
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-history"></i></div><div class="empty-state-title">No activity found</div><div class="empty-state-description">Your visit history will appear here.</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading detailed activity:', error);
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-state-title">Error loading activity</div><div class="empty-state-description">Please try again later.</div></div>';
        });
}

// Display detailed activity
function displayDetailedActivity(visits) {
    const container = document.getElementById('detailed-activity');
    if (!visits || visits.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-history"></i></div><div class="empty-state-title">No visits yet</div><div class="empty-state-description">Start visiting the salon to build your history!</div></div>';
        return;
    }

    const html = visits.map(visit => `
        <div class="detailed-activity-item" data-animate="fade-in">
            <div class="activity-date-badge">
                <div class="date-day">${new Date(visit.visitDate).getDate()}</div>
                <div class="date-month">${new Date(visit.visitDate).toLocaleDateString('en', {month: 'short'})}</div>
            </div>
            <div class="activity-details">
                <h4>Salon Visit</h4>
                <p><i class="fas fa-clock"></i> ${Utils.formatDate(visit.visitDate)}</p>
                ${visit.notes ? `<p><i class="fas fa-sticky-note"></i> ${visit.notes}</p>` : ''}
            </div>
            <div class="activity-points-earned">
                <i class="fas fa-coins"></i>
                +${visit.pointsEarned} points
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
    Animations.initializeAnimations();
}

// Load quick stats
function loadQuickStats() {
    // This would typically fetch updated stats
    // For now, we'll use the data already available on the page
    const statsElements = document.querySelectorAll('[data-animate="counter"]');
    statsElements.forEach(element => {
        if (Utils.isInViewport(element)) {
            Animations.animateCounter(element);
        }
    });
}

// Initialize check-in modal
function initializeCheckInModal() {
    const checkinForm = document.getElementById('checkin-form');
    if (checkinForm) {
        checkinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCheckIn();
        });
    }
}

// Handle check-in
function handleCheckIn() {
    const codeInput = document.getElementById('checkin-code');
    const code = codeInput.value.trim();

    if (!code) {
        showNotification('Please enter a check-in code', 'warning');
        return;
    }

    const submitButton = document.querySelector('#checkin-form button[type="submit"]');
    const originalText = submitButton.innerHTML;

    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking in...';
    submitButton.disabled = true;

    Utils.apiRequest('/api/customers/checkin', {
        method: 'POST',
        body: JSON.stringify({ code })
    })
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            closeCheckInModal();

            // Refresh dashboard data
            setTimeout(() => {
                loadRecentActivity();
                loadQuickStats();
                // Update points display if available
                if (data.data && data.data.customer) {
                    updatePointsDisplay(data.data.customer.availablePoints);
                }
            }, 1000);
        } else {
            showNotification(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Check-in error:', error);
        showNotification('Check-in failed. Please try again.', 'error');
    })
    .finally(() => {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    });
}

// Show check-in modal
function showCheckInModal() {
    const modal = document.getElementById('checkin-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.classList.add('animate-scale-in');
        }
        // Focus on the input after a short delay to ensure modal is visible
        setTimeout(() => {
            const codeInput = document.getElementById('checkin-code');
            if (codeInput) {
                codeInput.focus();
            }
        }, 100);
        document.body.style.overflow = 'hidden';
    }
}

// Close check-in modal
function closeCheckInModal() {
    const modal = document.getElementById('checkin-modal');
    if (modal) {
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.classList.add('animate-scale-out');
        }
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            if (content) {
                content.classList.remove('animate-scale-in', 'animate-scale-out');
            }
            const form = document.getElementById('checkin-form');
            if (form) {
                form.reset();
            }
            document.body.style.overflow = '';
        }, 300);
    }
}

// Load profile settings
function loadProfileSettings() {
    const container = document.getElementById('profile-settings');
    if (!container) return;

    // This would typically load user profile data
    container.innerHTML = `
        <div class="profile-section">
            <h3><i class="fas fa-user"></i> Profile Information</h3>
            <p>Profile editing functionality coming soon!</p>
            <button class="btn btn-outline" onclick="showNotification('Profile editing feature coming soon!', 'info')">
                <i class="fas fa-edit"></i> Edit Profile
            </button>
        </div>
        <div class="profile-section">
            <h3><i class="fas fa-bell"></i> Notification Preferences</h3>
            <p>Manage your notification settings.</p>
            <button class="btn btn-outline" onclick="showNotification('Notification settings coming soon!', 'info')">
                <i class="fas fa-cog"></i> Manage Notifications
            </button>
        </div>
    `;
}

// Scroll to rewards section
function scrollToRewards() {
    const rewardsSection = document.getElementById('rewards');
    if (rewardsSection) {
        Utils.scrollToElement('rewards', 100);
    } else {
        // If using tabs, switch to rewards tab
        switchDashboardTab('rewards');
    }
}

// Load reward criteria for customers (static data since it's basic info)
function loadRewardCriteria() {
    const container = document.getElementById('reward-criteria');
    if (!container) return;

    // Display static criteria since this is basic information
    const criteriaHtml = `
        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
            <div class="w-10 h-10 bg-primary-green/20 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-calendar-check text-primary-green"></i>
            </div>
            <div>
                <p class="font-medium text-gray-900">Visit Salon</p>
                <p class="text-sm text-gray-600">+10 points</p>
            </div>
        </div>
        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
            <div class="w-10 h-10 bg-primary-orange/20 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-user-plus text-primary-orange"></i>
            </div>
            <div>
                <p class="font-medium text-gray-900">First Visit</p>
                <p class="text-sm text-gray-600">+50 points</p>
            </div>
        </div>
        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
            <div class="w-10 h-10 bg-primary-purple/20 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-star text-primary-purple"></i>
            </div>
            <div>
                <p class="font-medium text-gray-900">Special Events</p>
                <p class="text-sm text-gray-600">Bonus points</p>
            </div>
        </div>
    `;

    container.innerHTML = criteriaHtml;
}

// Display reward criteria for customers
function displayRewardCriteria(criteria) {
    const container = document.getElementById('reward-criteria');

    const html = `
        <div class="criteria-info-card">
            <div class="criteria-header">
                <h3><i class="fas fa-star"></i> How to Earn Points</h3>
                <p>Complete these activities to earn points and unlock rewards</p>
            </div>
            <div class="criteria-content">
                ${criteria.map(criterion => `
                    <div class="criteria-item">
                        <div class="criteria-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="criteria-details">
                            <h4>${criterion.name}</h4>
                            <p>${criterion.description}</p>
                        </div>
                        <div class="criteria-points">+${criterion.points} pts</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// Update points display
function updatePointsDisplay(newPoints) {
    const pointsElement = document.querySelector('.points-number');
    if (pointsElement) {
        pointsElement.style.transform = 'scale(1.1)';
        pointsElement.style.color = 'var(--success)';
        setTimeout(() => {
            pointsElement.textContent = Utils.formatPoints(newPoints);
            pointsElement.style.transform = 'scale(1)';
            pointsElement.style.color = '';
        }, 200);
    }
}

// Load rewards preview for customer dashboard
function loadRewardsPreview() {
    const container = document.getElementById('rewards-preview');
    if (!container) return;

    // Get ALL rewards so customer can see what they're working toward
    fetch('/api/customers/rewards/all', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.rewards) {
                displayRewardsPreview(data.data.rewards, data.data.customerPoints);
            } else {
                container.innerHTML = `
                    <div class="text-center py-6 col-span-full">
                        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-gift text-gray-400"></i>
                        </div>
                        <p class="text-gray-600">No rewards available yet</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading rewards preview:', error);
            container.innerHTML = `
                <div class="text-center py-6 col-span-full">
                    <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-exclamation-triangle text-red-400"></i>
                    </div>
                    <p class="text-red-600">Error loading rewards</p>
                </div>
            `;
        });
}

// Display rewards preview with compact cards
function displayRewardsPreview(rewards, customerPoints) {
    const container = document.getElementById('rewards-preview');
    if (!rewards || rewards.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 col-span-full">
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-gift text-gray-400"></i>
                </div>
                <p class="text-gray-600">No rewards available yet</p>
            </div>
        `;
        return;
    }

    // Get customer points from parameter or from the page
    if (!customerPoints) {
        customerPoints = parseInt(document.querySelector('[data-customer-points]')?.dataset.customerPoints) || 0;
    }

    // Sort rewards by points required (lowest first) and show only active rewards
    const activeRewards = rewards.filter(reward => reward.isActive).sort((a, b) => a.pointsRequired - b.pointsRequired);

    const html = activeRewards.slice(0, 6).map(reward => {
        const canClaim = customerPoints >= reward.pointsRequired;
        const progressPercent = Math.min((customerPoints / reward.pointsRequired) * 100, 100);
        const pointsNeeded = Math.max(0, reward.pointsRequired - customerPoints);

        return `
            <div class="relative p-4 bg-white border-2 ${canClaim ? 'border-primary-green shadow-lg' : 'border-gray-200'} rounded-lg hover:shadow-md transition-all">
                ${canClaim ? '<div class="absolute -top-2 -right-2 w-6 h-6 bg-primary-green rounded-full flex items-center justify-center"><i class="fas fa-check text-white text-xs"></i></div>' : ''}

                <div class="flex items-center mb-3">
                    <div class="w-10 h-10 bg-primary-pink/20 rounded-lg flex items-center justify-center mr-3">
                        <i class="fas fa-gift text-primary-pink"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-900 text-sm">${reward.title}</h4>
                        <p class="text-xs text-gray-500 capitalize">${reward.category.replace('_', ' ')}</p>
                        <p class="text-xs font-medium text-primary-orange">${reward.value}</p>
                    </div>
                </div>

                <div class="mb-3">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs text-gray-600">Progress</span>
                        <span class="text-xs font-bold ${canClaim ? 'text-primary-green' : 'text-gray-600'}">${customerPoints}/${reward.pointsRequired}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="h-2 rounded-full transition-all ${canClaim ? 'bg-primary-green' : 'bg-primary-orange'}" style="width: ${progressPercent}%"></div>
                    </div>
                </div>

                <button class="w-full btn ${canClaim ? 'btn-primary' : 'btn-outline'} btn-sm" ${canClaim ? `onclick="redeemReward('${reward._id}')"` : 'disabled'}>
                    ${canClaim ? 'Claim Now' : pointsNeeded > 0 ? `Need ${pointsNeeded} more` : 'Available'}
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Helper function to format time ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

// Export dashboard functions
window.Dashboard = {
    initializeDashboard,
    switchDashboardTab,
    loadRecentActivity,
    loadRewardsPreview,
    handleCheckIn,
    showCheckInModal,
    closeCheckInModal,
    scrollToRewards,
    updatePointsDisplay
};

// Make functions globally available
window.initializeDashboard = initializeDashboard;
window.showCheckInModal = showCheckInModal;
window.closeCheckInModal = closeCheckInModal;
window.scrollToRewards = scrollToRewards;
window.handleCheckIn = handleCheckIn;
window.loadRewardsPreview = loadRewardsPreview;
