// Business Dashboard Functions for Fades n Braids

let dashboardRefreshInterval;
let isRefreshing = false;

// Initialize business dashboard
function initializeBusinessDashboard() {
    loadDashboardStats();
    loadCurrentCodes();
    startRealTimeUpdates();
    initializeBusinessTabs();
}

// Initialize business dashboard tabs
function initializeBusinessTabs() {
    console.log('Business tabs initialized');

    // Show overview tab by default
    showDashboardTab('overview');
}

// Show specific dashboard tab
function showDashboardTab(tabName) {
    console.log('Switching to tab:', tabName);

    // Update tab buttons
    document.querySelectorAll('.dashboard-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeTab = document.getElementById(`${tabName}-tab`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const activeContent = document.getElementById(`${tabName}-content`);
    if (activeContent) {
        activeContent.classList.add('active');
    }

    // Load tab-specific content
    loadTabContent(tabName);

    // Re-initialize animations for new content
    if (typeof Animations !== 'undefined') {
        setTimeout(() => {
            Animations.initializeAnimations();
        }, 100);
    }
}

// Load content for specific tab
function loadTabContent(tabName) {
    switch (tabName) {
        case 'overview':
            loadOverviewContent();
            break;
        case 'customers':
            loadCustomersContent();
            break;
        case 'rewards':
            loadRewardsContent();
            break;
        case 'analytics':
            loadAnalyticsContent();
            break;
        case 'tools':
            loadToolsContent();
            break;
    }
}

// Load overview tab content
function loadOverviewContent() {
    console.log('Loading overview content');
    loadRecentActivitySummary();
}

// Load customers tab content
function loadCustomersContent() {
    console.log('Loading customers content');
    loadCustomersList();
}

// Load rewards tab content
function loadRewardsContent() {
    console.log('Loading rewards content');
    loadRewardsList();
}

// Load analytics tab content
function loadAnalyticsContent() {
    console.log('Loading analytics content');
    // Analytics content uses existing functions - they will be called when data loads
}

// Load tools tab content
function loadToolsContent() {
    console.log('Loading tools content');
    // Tools content is static, no loading needed
}

// Start real-time updates
function startRealTimeUpdates() {
    // Refresh dashboard stats every 30 seconds
    dashboardRefreshInterval = setInterval(() => {
        if (!isRefreshing) {
            loadDashboardStats(true); // true indicates this is an auto-refresh
        }
    }, 30000);

    // Also refresh when the page becomes visible again
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !isRefreshing) {
            loadDashboardStats(true);
        }
    });
}

// Stop real-time updates
function stopRealTimeUpdates() {
    if (dashboardRefreshInterval) {
        clearInterval(dashboardRefreshInterval);
        dashboardRefreshInterval = null;
    }
}

// Load dashboard stats with proper error handling
function loadDashboardStats(isAutoRefresh = false) {
    if (isRefreshing) return;

    isRefreshing = true;

    // Show refresh indicator if it's an auto-refresh
    if (isAutoRefresh) {
        showRefreshIndicator();
    }

    Utils.apiRequest('/api/business/dashboard')
        .then(data => {
            if (data.success) {
                updateStats(data.data.stats, isAutoRefresh);
                displayRecentVisits(data.data.recentVisits);
                displayTopCustomers(data.data.topCustomers);
                displayRecentClaims(data.data.recentClaims);

                if (isAutoRefresh) {
                    showNotification('Dashboard updated', 'success', 2000);
                }
            } else {
                console.error('Dashboard API returned error:', data.message);
                if (isAutoRefresh) {
                    showNotification('Failed to update dashboard', 'error', 3000);
                }
            }
        })
        .catch(error => {
            console.error('Error loading dashboard stats:', error);
            if (isAutoRefresh) {
                showNotification('Failed to update dashboard', 'error', 3000);
            }
        })
        .finally(() => {
            isRefreshing = false;
            hideRefreshIndicator();
        });
}

// Update stats with proper null checking and animation
function updateStats(stats, isAutoRefresh = false) {
    console.log('Updating stats:', stats); // Debug log

    const elements = {
        'total-customers': Utils.safeValue(stats.totalCustomers, 0),
        'today-visits': Utils.safeValue(stats.todayVisits, 0),
        'total-visits': Utils.safeValue(stats.totalVisits, 0),
        'active-rewards': Utils.safeValue(stats.activeRewards, 0)
    };

    console.log('Processed elements:', elements); // Debug log

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        console.log(`Updating element ${id}:`, element, 'with value:', value); // Debug log

        if (element) {
            const numValue = Number(value) || 0;
            const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;

            // Only animate if the value has changed and it's an auto-refresh
            if (isAutoRefresh && currentValue !== numValue) {
                element.style.transform = 'scale(1.1)';
                element.style.color = 'var(--primary)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                    element.style.color = '';
                }, 300);
            }

            element.textContent = numValue.toLocaleString();
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    });
}

// Display recent visits with FontAwesome icons
function displayRecentVisits(visits) {
    const container = document.getElementById('recent-visits');
    if (!container) return;

    if (!visits || visits.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-users"></i></div><div class="empty-state-title">No recent visits</div><div class="empty-state-description">Customer visits will appear here.</div></div>';
        return;
    }

    const html = visits.map(visit => `
        <div class="activity-item" data-animate="fade-in">
            <div class="activity-icon">
                <i class="fas fa-user-check"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${visit.customer.firstName} ${visit.customer.lastName}</div>
                <div class="activity-date">
                    <i class="fas fa-clock"></i>
                    ${Utils.formatDate(visit.visitDate)}
                </div>
                <div class="activity-phone">
                    <i class="fas fa-phone"></i>
                    ${visit.customer.phone}
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

// Display top customers
function displayTopCustomers(customers) {
    const container = document.getElementById('top-customers');
    if (!container) return;

    if (!customers || customers.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-crown"></i></div><div class="empty-state-title">No customers yet</div><div class="empty-state-description">Top customers will appear here.</div></div>';
        return;
    }

    const html = customers.map((customer, index) => `
        <div class="customer-card" data-animate="fade-in" data-delay="${index * 100}">
            <div class="customer-rank">
                <i class="fas fa-medal"></i>
                #${index + 1}
            </div>
            <div class="customer-info">
                <h4>${customer.firstName} ${customer.lastName}</h4>
                <p><i class="fas fa-phone"></i> ${customer.phone}</p>
            </div>
            <div class="customer-stats">
                <div class="stat">
                    <i class="fas fa-coins"></i>
                    ${Utils.formatPoints(customer.totalPoints)} pts
                </div>
                <div class="stat">
                    <i class="fas fa-calendar-check"></i>
                    ${customer.totalVisits} visits
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
    Animations.initializeAnimations();
}

// Display recent reward claims
function displayRecentClaims(claims) {
    const container = document.getElementById('recent-claims');
    if (!container) return;

    if (!claims || claims.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-trophy"></i></div><div class="empty-state-title">No recent claims</div><div class="empty-state-description">Reward claims will appear here.</div></div>';
        return;
    }

    const html = claims.map(claim => `
        <div class="claim-card" data-animate="fade-in">
            <div class="claim-header">
                <div class="claim-customer">
                    <i class="fas fa-user"></i>
                    <span>${claim.customer.firstName} ${claim.customer.lastName}</span>
                </div>
                <div class="claim-date">
                    <i class="fas fa-clock"></i>
                    ${Utils.formatDateOnly(claim.redeemedAt)}
                </div>
            </div>
            <div class="claim-reward">
                <div class="reward-info">
                    <h4>${claim.reward.title}</h4>
                    <p class="reward-value">
                        <i class="fas fa-tag"></i>
                        ${claim.reward.value}
                    </p>
                </div>
                <div class="points-used">
                    <i class="fas fa-coins"></i>
                    ${claim.pointsUsed} pts
                </div>
            </div>
            <div class="claim-contact">
                <i class="fas fa-phone"></i>
                ${claim.customer.phone}
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
    Animations.initializeAnimations();
}

// Load current codes
function loadCurrentCodes() {
    Utils.apiRequest('/api/business/codes')
        .then(data => {
            if (data.success) {
                updateCodes(data.data);
            }
        })
        .catch(error => {
            console.error('Error loading codes:', error);
        });
}

// Update codes display
function updateCodes(codeData) {
    const qrImage = document.getElementById('qr-image');
    const qrLoading = document.getElementById('qr-loading');
    const digitCode = document.getElementById('digit-code');

    if (qrImage && codeData.qrCodeUrl) {
        qrImage.src = codeData.qrCodeUrl;
        qrImage.style.display = 'block';
        if (qrLoading) qrLoading.style.display = 'none';
    }

    if (digitCode && codeData.code) {
        digitCode.textContent = codeData.code;
    }
}

// Load recent activity summary for overview tab
function loadRecentActivitySummary() {
    const container = document.getElementById('recent-visits-summary');
    if (!container) return;

    Utils.showLoading(container, 'Loading recent activity...');

    Utils.apiRequest('/api/business/dashboard')
        .then(data => {
            if (data.success && data.data.recentVisits) {
                displayRecentActivitySummary(data.data.recentVisits);
            } else {
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-chart-line"></i></div><div class="empty-state-title">No recent activity</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading recent activity:', error);
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-state-title">Error loading activity</div></div>';
        });
}

// Display recent activity summary
function displayRecentActivitySummary(visits) {
    const container = document.getElementById('recent-visits-summary');

    if (!visits || visits.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-chart-line"></i></div><div class="empty-state-title">No recent activity</div></div>';
        return;
    }

    const recentVisits = visits.slice(0, 5); // Show only 5 most recent
    const html = `
        <div class="activity-summary-list">
            ${recentVisits.map(visit => `
                <div class="activity-summary-item">
                    <div class="activity-summary-icon">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <div class="activity-summary-content">
                        <div class="activity-summary-title">${visit.customer.firstName} ${visit.customer.lastName}</div>
                        <div class="activity-summary-time">${Utils.formatTimeAgo(visit.visitDate)}</div>
                    </div>
                    <div class="activity-summary-points">
                        <i class="fas fa-plus"></i>
                        ${visit.pointsEarned}
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="activity-summary-footer">
            <button class="btn btn-outline btn-small" onclick="showDashboardTab('analytics')">
                <i class="fas fa-chart-line"></i>
                View All Activity
            </button>
        </div>
    `;

    container.innerHTML = html;
}

// Load customers list for customers tab
function loadCustomersList() {
    const container = document.getElementById('customers-list');
    if (!container) return;

    Utils.showLoading(container, 'Loading customers...');

    Utils.apiRequest('/api/business/customers')
        .then(data => {
            if (data.success) {
                displayCustomersList(data.data.customers);
            } else {
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-users"></i></div><div class="empty-state-title">No customers found</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading customers:', error);
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-state-title">Error loading customers</div></div>';
        });
}

// Display customers list
function displayCustomersList(customers) {
    const container = document.getElementById('customers-list');

    if (!customers || customers.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-users"></i></div><div class="empty-state-title">No customers yet</div></div>';
        return;
    }

    const html = customers.map(customer => `
        <div class="customer-list-card" data-animate="fade-in">
            <div class="customer-list-header">
                <div class="customer-list-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="customer-list-info">
                    <h4>${customer.firstName} ${customer.lastName}</h4>
                    <p><i class="fas fa-phone"></i> ${customer.phone}</p>
                    <p><i class="fas fa-calendar-plus"></i> Joined ${Utils.formatDateOnly(customer.joinDate)}</p>
                </div>
                <div class="customer-list-stats">
                    <div class="stat-badge">
                        <i class="fas fa-coins"></i>
                        ${Utils.formatPoints(customer.availablePoints)} pts
                    </div>
                    <div class="stat-badge">
                        <i class="fas fa-calendar-check"></i>
                        ${customer.totalVisits} visits
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
    Animations.initializeAnimations();
}

// Load rewards list for rewards tab
function loadRewardsList() {
    const container = document.getElementById('rewards-list');
    if (!container) return;

    Utils.showLoading(container, 'Loading rewards...');

    Utils.apiRequest('/api/business/rewards')
        .then(data => {
            if (data.success) {
                displayRewardsList(data.data.rewards);
            } else {
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-gift"></i></div><div class="empty-state-title">No rewards found</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading rewards:', error);
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-state-title">Error loading rewards</div></div>';
        });
}

// Display rewards list
function displayRewardsList(rewards) {
    const container = document.getElementById('rewards-list');

    if (!rewards || rewards.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-gift"></i></div><div class="empty-state-title">No rewards yet</div></div>';
        return;
    }

    const html = rewards.map(reward => `
        <div class="reward-list-card" data-animate="fade-in">
            <div class="reward-list-header">
                <div class="reward-list-icon">
                    <i class="fas fa-gift"></i>
                </div>
                <div class="reward-list-info">
                    <h4>${reward.title}</h4>
                    <p class="reward-description">${reward.description}</p>
                    <div class="reward-meta">
                        <span class="reward-category">
                            <i class="fas fa-tag"></i>
                            ${reward.category.replace('_', ' ')}
                        </span>
                        <span class="reward-value">
                            <i class="fas fa-dollar-sign"></i>
                            ${reward.value}
                        </span>
                    </div>
                </div>
                <div class="reward-list-points">
                    <div class="points-badge">
                        <i class="fas fa-coins"></i>
                        ${reward.pointsRequired} pts
                    </div>
                    <div class="reward-status ${reward.isActive ? 'active' : 'inactive'}">
                        <i class="fas fa-${reward.isActive ? 'check-circle' : 'pause-circle'}"></i>
                        ${reward.isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
    Animations.initializeAnimations();
}

// Load customers data for customers tab
function loadCustomersData() {
    const container = document.getElementById('customers-data');
    if (!container) return;

    Utils.showLoading(container, 'Loading customers...');

    Utils.apiRequest('/api/business/customers')
        .then(data => {
            if (data.success) {
                displayCustomersData(data.data.customers);
            } else {
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-users"></i></div><div class="empty-state-title">No customers found</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading customers:', error);
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-state-title">Error loading customers</div></div>';
        });
}

// Display customers data with claimed rewards info
function displayCustomersData(customers) {
    const container = document.getElementById('customers-data');

    if (!customers || customers.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-users"></i></div><div class="empty-state-title">No customers yet</div></div>';
        return;
    }

    const html = customers.map(customer => `
        <div class="customer-detail-card" data-animate="fade-in">
            <div class="customer-header">
                <div class="customer-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="customer-basic-info">
                    <h4>${customer.firstName} ${customer.lastName}</h4>
                    <p><i class="fas fa-phone"></i> ${customer.phone}</p>
                    <p><i class="fas fa-calendar-plus"></i> Joined ${Utils.formatDateOnly(customer.joinDate)}</p>
                </div>
            </div>
            <div class="customer-stats-grid">
                <div class="stat-item">
                    <i class="fas fa-coins"></i>
                    <span class="stat-value">${Utils.formatPoints(customer.totalPoints)}</span>
                    <span class="stat-label">Total Points</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-wallet"></i>
                    <span class="stat-value">${Utils.formatPoints(customer.availablePoints)}</span>
                    <span class="stat-label">Available</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-calendar-check"></i>
                    <span class="stat-value">${customer.totalVisits}</span>
                    <span class="stat-label">Visits</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-gift"></i>
                    <span class="stat-value">${Utils.safeLength(customer.rewards)}</span>
                    <span class="stat-label">Rewards Claimed</span>
                </div>
            </div>
            ${customer.rewards && customer.rewards.length > 0 ? `
                <div class="customer-rewards">
                    <h5><i class="fas fa-trophy"></i> Recent Rewards</h5>
                    <div class="rewards-list">
                        ${customer.rewards.slice(0, 3).map(reward => `
                            <div class="reward-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Claimed reward (${reward.pointsUsed} pts)</span>
                                <small>${Utils.formatDateOnly(reward.redeemedAt)}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');

    container.innerHTML = html;
    Animations.initializeAnimations();
}

// Refresh indicator functions
function showRefreshIndicator() {
    let indicator = document.getElementById('refresh-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'refresh-indicator';
        indicator.className = 'refresh-indicator';
        indicator.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i><span>Updating...</span>';
        document.body.appendChild(indicator);
    }
    indicator.style.display = 'flex';
}

function hideRefreshIndicator() {
    const indicator = document.getElementById('refresh-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// Manual refresh function
function refreshDashboard() {
    if (!isRefreshing) {
        loadDashboardStats(false);
        showNotification('Dashboard refreshed', 'success', 2000);
    }
}

// Refresh codes
function refreshCodes() {
    loadCurrentCodes();
    showNotification('Codes refreshed!', 'success');
}

// Load rewards management
function loadRewardsManagement() {
    const container = document.getElementById('rewards-management');
    if (!container) return;

    container.innerHTML = `
        <div class="rewards-management-section">
            <h3><i class="fas fa-gift"></i> Rewards Management</h3>
            <p>Manage your rewards catalog and view redemption statistics.</p>
            <button class="btn btn-primary" onclick="showRewardsModal()">
                <i class="fas fa-plus"></i> Manage Rewards
            </button>
        </div>
    `;
}

// Load analytics data
function loadAnalyticsData() {
    const container = document.getElementById('analytics-data');
    if (!container) return;

    container.innerHTML = `
        <div class="analytics-section">
            <h3><i class="fas fa-chart-bar"></i> Analytics</h3>
            <p>Detailed analytics and reporting features coming soon!</p>
            <button class="btn btn-outline" onclick="showAnalytics()">
                <i class="fas fa-chart-line"></i> View Analytics
            </button>
        </div>
    `;
}

// Clean up real-time updates when leaving the page
window.addEventListener('beforeunload', () => {
    stopRealTimeUpdates();
});

// Export business dashboard functions
window.BusinessDashboard = {
    initializeBusinessDashboard,
    switchBusinessTab,
    loadDashboardStats,
    refreshDashboard,
    refreshCodes,
    startRealTimeUpdates,
    stopRealTimeUpdates
};

// Make functions globally available
window.initializeBusinessDashboard = initializeBusinessDashboard;
window.refreshDashboard = refreshDashboard;
window.refreshCodes = refreshCodes;
