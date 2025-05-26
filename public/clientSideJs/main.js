// Main JavaScript for Fades n Braids
// Core functionality and page initialization

document.addEventListener('DOMContentLoaded', function() {
    console.log('Fades n Braids app loaded');

    // Initialize based on page type
    initializeApp();

    // Initialize mobile navigation
    initializeMobileNavigation();

    // Initialize notifications
    initializeNotifications();
});

// Initialize the application
function initializeApp() {
    const path = window.location.pathname;

    // Customer dashboard
    if (path.includes('/customer/dashboard')) {
        initializeCustomerDashboard();
    }

    // Business dashboard
    if (path.includes('/business/dashboard')) {
        initializeBusinessDashboard();
    }

    // Check-in codes page
    if (path.includes('/checkin-codes')) {
        initializeCheckInCodes();
    }

    // Landing page
    if (path === '/') {
        initializeLandingPage();
    }
}

// Landing page initialization
function initializeLandingPage() {
    console.log('Initializing landing page');

    // Update customer points if user is logged in
    const pointsDisplay = document.querySelector('.points-display');
    if (pointsDisplay) {
        loadCustomerPoints();
    }
}

function loadCustomerPoints() {
    fetch('/api/customers/profile')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.customer) {
                const pointsDisplay = document.querySelector('.points-display');
                if (pointsDisplay) {
                    const points = data.data.customer.availablePoints || 0;
                    pointsDisplay.innerHTML = `You have <strong>${points.toLocaleString()} points</strong> available!`;
                }
            }
        })
        .catch(error => {
            console.error('Error loading customer points:', error);
        });
}

// Customer Dashboard Functions
function initializeCustomerDashboard() {
    console.log('Initializing customer dashboard');
    loadCustomerData();
    loadRecentActivity();
    loadAvailableRewards();
    loadClaimedRewards();
    initializeCustomerTabs();
}

function loadCustomerData() {
    // Customer data is already loaded from server-side rendering
    // Add any dynamic updates here if needed
    console.log('Customer data loaded');
}

function loadRecentActivity() {
    fetch('/api/customers/visits')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayRecentActivity(data.data.visits);
            }
        })
        .catch(error => {
            console.error('Error loading recent activity:', error);
            const container = document.getElementById('recent-activity');
            if (container) {
                container.innerHTML = '<p class="text-center">Unable to load recent activity</p>';
            }
        });
}

function displayRecentActivity(visits) {
    const container = document.getElementById('recent-activity');
    if (!container) return;

    if (!visits || visits.length === 0) {
        container.innerHTML = '<p class="text-center">No recent activity</p>';
        return;
    }

    const html = visits.slice(0, 5).map(visit => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">Check-in</div>
                <div class="activity-date">${formatDate(visit.visitDate)}</div>
            </div>
            <div class="activity-points">+${visit.pointsEarned}</div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function loadAvailableRewards() {
    const container = document.getElementById('rewards-grid');
    if (container) {
        container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><span>Loading rewards...</span></div>';
    }

    fetch('/api/customers/rewards/all')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayAvailableRewards(data.data.rewards, data.data.customerPoints);
                displayRewardCriteria();
            } else {
                if (container) {
                    container.innerHTML = '<p class="text-center">No rewards available at this time</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading available rewards:', error);
            if (container) {
                container.innerHTML = '<p class="text-center">Unable to load rewards</p>';
            }
        });
}

function displayRewardCriteria() {
    const criteriaContainer = document.getElementById('reward-criteria');
    if (!criteriaContainer) return;

    const criteriaHtml = `
        <div class="criteria-card">
            <div class="criteria-header">
                <i class="fas fa-star"></i>
                <h4>How to Earn Points</h4>
            </div>
            <div class="criteria-content">
                <div class="criteria-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Check-in at salon: <strong>10 points</strong></span>
                </div>
                <div class="criteria-item">
                    <i class="fas fa-gift"></i>
                    <span>Welcome bonus: <strong>50 points</strong></span>
                </div>
                <div class="criteria-item">
                    <i class="fas fa-birthday-cake"></i>
                    <span>Birthday bonus: <strong>25 points</strong></span>
                </div>
            </div>
            <button class="btn btn-outline" onclick="showCheckInModal()">
                <i class="fas fa-qr-code"></i>
                Check In Now
            </button>
        </div>
    `;

    criteriaContainer.innerHTML = criteriaHtml;
}

// Initialize mobile navigation
function initializeMobileNavigation() {
    // Create mobile menu toggle if it doesn't exist
    const navbar = document.querySelector('.navbar .container');
    if (navbar && !document.getElementById('navbar-toggle')) {
        const navMenu = document.querySelector('.navbar-menu');
        if (navMenu) {
            // Create toggle button
            const toggleButton = document.createElement('button');
            toggleButton.id = 'navbar-toggle';
            toggleButton.className = 'navbar-toggle';
            toggleButton.innerHTML = `
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            `;

            // Insert toggle button before nav menu
            navMenu.parentNode.insertBefore(toggleButton, navMenu);

            // Add mobile menu class
            navMenu.id = 'navbar-menu';
            navMenu.classList.add('navbar-menu-mobile');
        }
    }

    const navToggle = document.getElementById('navbar-toggle');
    const navMenu = document.getElementById('navbar-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');

            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close menu on window resize if it gets too wide
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close menu when navigation link is clicked
        navMenu.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Customer rewards functions
function displayAvailableRewards(rewards, customerPoints) {
    const container = document.getElementById('rewards-grid');
    if (!container) return;

    if (!rewards || rewards.length === 0) {
        container.innerHTML = '<p class="text-center">No rewards available</p>';
        return;
    }

    // Get customer points from the data or from the page
    if (!customerPoints) {
        customerPoints = parseInt(document.querySelector('[data-customer-points]')?.dataset.customerPoints) || 0;
    }

    const html = rewards.map(reward => {
        const canClaim = customerPoints >= reward.pointsRequired;
        const pointsNeeded = Math.max(0, reward.pointsRequired - customerPoints);

        return `
            <div class="reward-card ${canClaim ? 'claimable' : 'not-claimable'}">
                <div class="reward-header">
                    <span class="reward-category">${reward.category.replace('_', ' ')}</span>
                    <span class="reward-points">${reward.pointsRequired} pts</span>
                    ${canClaim ? '<span class="claimable-badge">✓ Available</span>' : ''}
                </div>
                <h4 class="reward-title">${reward.title}</h4>
                <p class="reward-description">${reward.description}</p>
                <div class="reward-value">Value: ${reward.value}</div>
                <div class="reward-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min((customerPoints / reward.pointsRequired) * 100, 100)}%"></div>
                    </div>
                    <span class="progress-text">${customerPoints}/${reward.pointsRequired} points</span>
                </div>
                <button class="btn ${canClaim ? 'btn-primary' : 'btn-outline'} reward-btn"
                        ${canClaim ? `onclick="redeemReward('${reward._id}')"` : 'disabled'}>
                    ${canClaim ? 'Redeem Now' : `Need ${pointsNeeded} more points`}
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

function loadClaimedRewards() {
    fetch('/api/customers/rewards/claimed')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayClaimedRewards(data.data.rewards);
            }
        })
        .catch(error => {
            console.error('Error loading claimed rewards:', error);
        });
}

function displayClaimedRewards(rewards) {
    const container = document.getElementById('claimed-rewards-grid');
    if (!container) return;

    if (!rewards || rewards.length === 0) {
        container.innerHTML = '<p class="text-center">No rewards claimed yet</p>';
        return;
    }

    const html = rewards.map(reward => `
        <div class="claimed-reward-card">
            <div class="reward-header">
                <span class="reward-category">${reward.rewardId.category.replace('_', ' ')}</span>
                <span class="reward-date">${formatDate(reward.redeemedAt)}</span>
            </div>
            <h4 class="reward-title">${reward.rewardId.title}</h4>
            <p class="reward-description">${reward.rewardId.description}</p>
            <div class="reward-points-used">Used: ${reward.pointsUsed} points</div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Customer tab functionality
function initializeCustomerTabs() {
    const tabButtons = document.querySelectorAll('.rewards-tabs .tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.onclick.toString().match(/'([^']+)'/)[1];
            showRewardsTab(tabName);
        });
    });
}

function showRewardsTab(tabName) {
    // Remove active class from all tabs and buttons
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // Add active class to selected tab and button
    const activeTab = document.getElementById(`${tabName}-rewards-tab`);
    const activeButton = document.getElementById(`${tabName}-tab`);

    if (activeTab) activeTab.classList.add('active');
    if (activeButton) activeButton.classList.add('active');

    // Load content based on tab
    if (tabName === 'available') {
        loadAvailableRewards();
    } else if (tabName === 'claimed') {
        loadClaimedRewards();
    }
}

// Customer action functions - these are handled by dashboard.js
// Removed duplicate functions to avoid conflicts

// Remove duplicate redeemReward function - handled in rewards.js

// Check-in form handler is now handled in dashboard.js to avoid conflicts

// Business Dashboard Functions
function initializeBusinessDashboard() {
    console.log('Initializing business dashboard');
    loadDashboardStats();
    loadCurrentCodes();
    initializeBusinessTabs();
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
    const summaryContainer = document.getElementById('recent-visits-summary');

    if (!visits || visits.length === 0) {
        if (container) container.innerHTML = '<p class="text-center">No recent visits</p>';
        if (summaryContainer) summaryContainer.innerHTML = '<p class="text-center">No recent activity</p>';
        return;
    }

    // Full table for analytics tab
    if (container) {
        const html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Date</th>
                        <th>Action</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    ${visits.map(visit => `
                        <tr>
                            <td>${visit.customer ? `${visit.customer.firstName} ${visit.customer.lastName}` : 'Unknown'}</td>
                            <td>${visit.customer ? visit.customer.phone : 'N/A'}</td>
                            <td>${formatDate(visit.visitDate)}</td>
                            <td>Check-in</td>
                            <td class="points-cell">+${visit.pointsEarned}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        container.innerHTML = html;
    }

    // Summary for overview tab
    if (summaryContainer) {
        const recentFive = visits.slice(0, 5);
        const summaryHtml = recentFive.map(visit => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${visit.customer ? visit.customer.firstName : 'Unknown'} checked in</div>
                    <div class="activity-date">${formatDate(visit.visitDate)}</div>
                </div>
                <div class="activity-points">+${visit.pointsEarned}</div>
            </div>
        `).join('');

        summaryContainer.innerHTML = summaryHtml;
    }
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

// Business tab functionality
function initializeBusinessTabs() {
    const tabButtons = document.querySelectorAll('.dashboard-tabs .tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Extract tab name from onclick attribute or id
            const onclickAttr = this.getAttribute('onclick');
            let tabName = '';

            if (onclickAttr) {
                const match = onclickAttr.match(/showDashboardTab\('([^']+)'\)/);
                if (match) {
                    tabName = match[1];
                }
            }

            if (!tabName && this.id) {
                tabName = this.id.replace('-tab', '');
            }

            if (tabName) {
                showDashboardTab(tabName);
            }
        });
    });
}

function showDashboardTab(tabName) {
    console.log('Switching to business tab:', tabName);

    // Remove active class from all tabs and buttons
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.dashboard-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));

    // Add active class to selected tab and button
    const activeTab = document.getElementById(`${tabName}-content`);
    const activeButton = document.getElementById(`${tabName}-tab`);

    if (activeTab) {
        activeTab.classList.add('active');
        console.log('Activated tab content:', `${tabName}-content`);
    } else {
        console.warn('Tab content not found:', `${tabName}-content`);
    }

    if (activeButton) {
        activeButton.classList.add('active');
        console.log('Activated tab button:', `${tabName}-tab`);
    } else {
        console.warn('Tab button not found:', `${tabName}-tab`);
    }

    // Load content based on tab
    if (tabName === 'overview') {
        loadDashboardStats();
    } else if (tabName === 'customers') {
        loadCustomersData();
    } else if (tabName === 'rewards') {
        loadRewardsData();
    } else if (tabName === 'analytics') {
        loadDashboardStats(); // This loads recent visits and top customers
    }
}

// Check-in codes page initialization
function initializeCheckInCodes() {
    console.log('Initializing check-in codes page');
    loadCurrentCodes();

    // Auto-refresh codes every 30 seconds
    setInterval(loadCurrentCodes, 30000);
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

// Load customers data for business dashboard
function loadCustomersData() {
    const container = document.getElementById('customers-table');
    if (!container) return;

    container.innerHTML = `
        <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue mr-3"></div>
            <span class="text-gray-600">Loading customers...</span>
        </div>
    `;

    fetch('/api/business/customers')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Use the business dashboard function instead
                if (typeof displayCustomersData === 'function') {
                    displayCustomersData(data.data.customers);
                } else {
                    displayCustomers(data.data.customers);
                }
            } else {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="empty-state-title">Failed to load customers</div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading customers:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="empty-state-title">Error loading customers</div>
                </div>
            `;
        });
}

function displayCustomers(customers) {
    const container = document.getElementById('customers-table');
    if (!container) return;

    if (!customers || customers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="empty-state-title">No customers found</div>
                <div class="empty-state-description">No customers match your current filters.</div>
            </div>
        `;
        return;
    }

    const html = customers.map(customer => `
        <div class="customer-card">
            <div class="customer-header">
                <div class="customer-info">
                    <h4 class="customer-name">${customer.firstName} ${customer.lastName}</h4>
                    <p class="customer-phone">${customer.phone}</p>
                    <p class="customer-email">${customer.email || 'No email'}</p>
                </div>
                <div class="customer-status ${customer.isActive ? 'active' : 'inactive'}">
                    ${customer.isActive ? 'Active' : 'Inactive'}
                </div>
            </div>
            <div class="customer-stats">
                <div class="stat">
                    <span class="stat-value">${customer.totalPoints.toLocaleString()}</span>
                    <span class="stat-label">Total Points</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${customer.availablePoints.toLocaleString()}</span>
                    <span class="stat-label">Available</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${customer.totalVisits}</span>
                    <span class="stat-label">Visits</span>
                </div>
            </div>
            <div class="customer-actions">
                <button class="btn btn-small btn-outline" onclick="viewCustomerDetails('${customer._id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-small btn-primary" onclick="awardPointsToCustomer('${customer._id}')">
                    <i class="fas fa-plus"></i> Award Points
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Load rewards data for business dashboard
function loadRewardsData() {
    const container = document.getElementById('rewards-list');
    if (!container) return;

    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><span>Loading rewards...</span></div>';

    fetch('/api/business/rewards')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayBusinessRewards(data.data.rewards);
            } else {
                container.innerHTML = '<p class="text-center">Failed to load rewards</p>';
            }
        })
        .catch(error => {
            console.error('Error loading rewards:', error);
            container.innerHTML = '<p class="text-center">Error loading rewards</p>';
        });
}

function displayBusinessRewards(rewards) {
    const container = document.getElementById('rewards-list');
    if (!container) return;

    if (!rewards || rewards.length === 0) {
        container.innerHTML = '<p class="text-center">No rewards found</p>';
        return;
    }

    const html = rewards.map(reward => `
        <div class="reward-card business-reward-card">
            <div class="reward-header">
                <span class="reward-category">${reward.category.replace('_', ' ')}</span>
                <span class="reward-status ${reward.isActive ? 'active' : 'inactive'}">
                    ${reward.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>
            <h4 class="reward-title">${reward.title}</h4>
            <p class="reward-description">${reward.description}</p>
            <div class="reward-details">
                <div class="reward-value">Value: ${reward.value}</div>
                <div class="reward-points">${reward.pointsRequired} points required</div>
                <div class="reward-stock">Stock: ${reward.stock === -1 ? 'Unlimited' : reward.stock}</div>
            </div>
            <div class="reward-actions">
                <button class="btn btn-small btn-outline" onclick="editReward('${reward._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-small ${reward.isActive ? 'btn-warning' : 'btn-success'}"
                        onclick="toggleRewardStatus('${reward._id}', ${reward.isActive})">
                    <i class="fas fa-${reward.isActive ? 'pause' : 'play'}"></i>
                    ${reward.isActive ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function showNotification(message, type = 'info', duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto-hide notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);

    // Close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

function initializeNotifications() {
    // Add notification styles if not present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            .notification.show {
                transform: translateX(0);
            }
            .notification-content {
                padding: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .notification-success {
                border-left: 4px solid #10b981;
            }
            .notification-error {
                border-left: 4px solid #ef4444;
            }
            .notification-warning {
                border-left: 4px solid #f59e0b;
            }
            .notification-info {
                border-left: 4px solid #3b82f6;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                margin-left: 12px;
            }
        `;
        document.head.appendChild(style);
    }
}

// Legacy support functions
function showVisitHistory() {
    showNotification('Visit history feature coming soon!', 'info');
}

function showProfile() {
    showNotification('Profile editing feature coming soon!', 'info');
}

function showRewardCriteria() {
    showNotification('Reward criteria: Check-in = 10 points, Welcome bonus = 50 points', 'info', 8000);
}

function scrollToRewards() {
    const rewardsSection = document.getElementById('rewards');
    if (rewardsSection) {
        rewardsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Business dashboard action functions
function viewCustomerDetails(customerId) {
    showNotification('Customer details feature coming soon!', 'info');
}

function awardPointsToCustomer(customerId) {
    showNotification('Award points feature coming soon!', 'info');
}

function editReward(rewardId) {
    showNotification('Edit reward feature coming soon!', 'info');
}

function toggleRewardStatus(rewardId, isActive) {
    const action = isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} this reward?`)) {
        fetch(`/api/business/rewards/${rewardId}/toggle`, {
            method: 'POST',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                loadRewardsData(); // Refresh the rewards list
            } else {
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error toggling reward status:', error);
            showNotification('Failed to update reward status', 'error');
        });
    }
}

function refreshDashboard() {
    showNotification('Refreshing dashboard...', 'info');
    loadDashboardStats();
    loadCurrentCodes();
}

// Export functions for global access
window.showRewardsTab = showRewardsTab;
window.showCheckInModal = showCheckInModal;
window.closeCheckInModal = closeCheckInModal;
window.redeemReward = redeemReward;
window.showDashboardTab = showDashboardTab;
window.refreshCodes = refreshCodes;
window.refreshDashboard = refreshDashboard;
window.viewCustomerDetails = viewCustomerDetails;
window.awardPointsToCustomer = awardPointsToCustomer;
window.editReward = editReward;
window.toggleRewardStatus = toggleRewardStatus;