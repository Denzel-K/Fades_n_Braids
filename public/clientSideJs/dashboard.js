// Customer Dashboard Functions for Fades n Braids

// Initialize customer dashboard
function initializeDashboard() {
    loadRecentActivity();
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

// Display recent activity with FontAwesome icons
function displayRecentActivity(visits) {
    const container = document.getElementById('recent-activity');
    if (!visits || visits.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-history"></i></div><div class="empty-state-title">No recent visits</div><div class="empty-state-description">Check in at the salon to start earning points!</div></div>';
        return;
    }

    const html = visits.map(visit => `
        <div class="activity-item" data-animate="fade-in">
            <div class="activity-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">Check-in completed</div>
                <div class="activity-date">
                    <i class="fas fa-clock"></i>
                    ${Utils.formatDate(visit.visitDate)}
                </div>
            </div>
            <div class="activity-points">
                <i class="fas fa-plus"></i>
                ${visit.pointsEarned}
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
    Animations.initializeAnimations();
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
        modal.classList.add('show');
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.classList.add('scale-in');
        }
        document.getElementById('checkin-code').focus();
        document.body.style.overflow = 'hidden';
    }
}

// Close check-in modal
function closeCheckInModal() {
    const modal = document.getElementById('checkin-modal');
    if (modal) {
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.classList.add('scale-out');
        }
        setTimeout(() => {
            modal.classList.remove('show');
            if (content) {
                content.classList.remove('scale-in', 'scale-out');
            }
            document.getElementById('checkin-form').reset();
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

// Export dashboard functions
window.Dashboard = {
    initializeDashboard,
    switchDashboardTab,
    loadRecentActivity,
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
