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
    setupRewardsTab();
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

    const html = claims.slice(0, 6).map((claim, index) => `
        <div class="flex items-center justify-between p-2.5 bg-gradient-to-r from-white to-gray-50 rounded-lg hover:from-primary-orange/5 hover:to-primary-pink/5 transition-all duration-200 border border-gray-100 hover:border-primary-orange/20" data-animate="fade-in" data-delay="${index * 50}">
            <div class="flex items-center">
                <div class="w-7 h-7 bg-gradient-to-br from-primary-orange to-primary-pink rounded-full flex items-center justify-center mr-3 shadow-sm">
                    <i class="fas fa-gift text-white text-xs"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-900 text-sm mb-0.5">${claim.customer.firstName} ${claim.customer.lastName}</p>
                    <p class="text-xs text-gray-500 flex items-center">
                        <i class="fas fa-clock mr-1 text-gray-400"></i>
                        ${Utils.formatTimeAgo(claim.redeemedAt)}
                    </p>
                </div>
            </div>
            <div class="flex items-center bg-gradient-to-r from-primary-orange to-primary-pink text-white px-2 py-1 rounded-full text-xs font-semibold">
                <i class="fas fa-minus mr-1" style="font-size: 10px;"></i>
                ${claim.pointsUsed}
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

    const recentVisits = visits.slice(0, 6); // Show only 6 most recent for compact view
    const html = `
        <div class="space-y-2">
            ${recentVisits.map((visit, index) => `
                <div class="flex items-center justify-between p-2.5 bg-gradient-to-r from-white to-gray-50 rounded-lg hover:from-primary-purple/5 hover:to-primary-blue/5 transition-all duration-200 border border-gray-100 hover:border-primary-purple/20" data-animate="fade-in" data-delay="${index * 50}">
                    <div class="flex items-center">
                        <div class="w-7 h-7 bg-gradient-to-br from-primary-purple to-primary-blue rounded-full flex items-center justify-center mr-3 shadow-sm">
                            <i class="fas fa-user text-white text-xs"></i>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 text-sm mb-0.5">${visit.customer.firstName} ${visit.customer.lastName}</p>
                            <p class="text-xs text-gray-500 flex items-center">
                                <i class="fas fa-clock mr-1 text-gray-400"></i>
                                ${Utils.formatTimeAgo(visit.visitDate)}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center bg-gradient-to-r from-primary-purple to-primary-blue text-white px-2 py-1 rounded-full text-xs font-semibold">
                        <i class="fas fa-plus mr-1" style="font-size: 10px;"></i>
                        ${visit.pointsEarned}
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="mt-4 text-center">
            <button class="btn btn-outline btn-sm text-xs" onclick="showDashboardTab('analytics')">
                <i class="fas fa-chart-line mr-1"></i>
                View Analytics
            </button>
        </div>
    `;

    container.innerHTML = html;
    if (typeof Animations !== 'undefined') {
        Animations.initializeAnimations();
    }
}

// Load customers list for customers tab
function loadCustomersList() {
    console.log('Loading customers list...');
    const container = document.getElementById('customers-table');
    if (!container) {
        console.error('customers-table container not found');
        return;
    }

    Utils.showLoading(container, 'Loading customers...');

    Utils.apiRequest('/api/business/customers')
        .then(data => {
            console.log('Customers API response:', data);
            if (data.success) {
                displayCustomersTable(data.data.customers);
            } else {
                console.warn('No customers found or API returned error:', data);
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-users"></i></div><div class="empty-state-title">No customers found</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading customers:', error);
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-state-title">Error loading customers</div></div>';
        });
}

// Display customers table
function displayCustomersTable(customers) {
    console.log('Displaying customers table with data:', customers);
    const container = document.getElementById('customers-table');

    if (!container) {
        console.error('customers-table container not found in displayCustomersTable');
        return;
    }

    if (!customers || customers.length === 0) {
        console.log('No customers to display');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-users"></i></div>
                <div class="empty-state-title">No customers yet</div>
                <div class="empty-state-description">Start building your customer base by adding your first customer.</div>
                <button class="btn btn-primary" onclick="showAddCustomerModal()">
                    <i class="fas fa-user-plus"></i>
                    Add First Customer
                </button>
            </div>
        `;
        return;
    }

    const html = `
        <table class="customers-table">
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Total Points</th>
                    <th>Available Points</th>
                    <th>Visits</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${customers.map(customer => `
                    <tr>
                        <td>
                            <div class="customer-info">
                                <div class="customer-avatar">
                                    ${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}
                                </div>
                                <div class="customer-details">
                                    <h4>${customer.firstName} ${customer.lastName}</h4>
                                    <p>ID: ${customer.phone}</p>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div>
                                <div>${customer.phone}</div>
                                <div style="font-size: 0.75rem; color: var(--gray-500);">
                                    ${customer.email || 'No email'}
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="status-badge ${customer.isActive ? 'active' : 'inactive'}">
                                ${customer.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <span class="points-display">${Utils.formatPoints(customer.totalPoints || 0)}</span>
                        </td>
                        <td>
                            <span class="points-display">${Utils.formatPoints(customer.availablePoints || 0)}</span>
                        </td>
                        <td>${customer.totalVisits || 0}</td>
                        <td>
                            <div class="customer-actions">
                                <button class="action-btn edit" onclick="viewCustomer('${customer._id}')" title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn" onclick="awardPointsToCustomer('${customer._id}', '${customer.firstName} ${customer.lastName}')" title="Award Points">
                                    <i class="fas fa-plus"></i>
                                </button>
                                <button class="action-btn edit" onclick="editCustomer('${customer._id}')" title="Edit Customer">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete" onclick="deleteCustomer('${customer._id}')" title="Delete Customer">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
    setupCustomerSearch(customers);
    Animations.initializeAnimations();
}

// Setup customer search and filter functionality
function setupCustomerSearch(customers) {
    const searchInput = document.getElementById('customer-search');
    const filterSelect = document.getElementById('customer-filter');

    if (!searchInput || !filterSelect) {
        console.warn('Search input or filter select not found');
        return;
    }

    // Store original customers data
    window.originalCustomersData = customers;

    function filterCustomers() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;

        let filteredCustomers = window.originalCustomersData;

        // Apply search filter
        if (searchTerm) {
            filteredCustomers = filteredCustomers.filter(customer =>
                customer.firstName.toLowerCase().includes(searchTerm) ||
                customer.lastName.toLowerCase().includes(searchTerm) ||
                customer.phone.includes(searchTerm) ||
                (customer.email && customer.email.toLowerCase().includes(searchTerm))
            );
        }

        // Apply status filter
        if (filterValue !== 'all') {
            filteredCustomers = filteredCustomers.filter(customer => {
                if (filterValue === 'active') return customer.isActive;
                if (filterValue === 'inactive') return !customer.isActive;
                return true;
            });
        }

        displayCustomersTable(filteredCustomers);
    }

    // Remove existing event listeners to prevent duplicates
    searchInput.removeEventListener('input', filterCustomers);
    filterSelect.removeEventListener('change', filterCustomers);

    // Add event listeners
    searchInput.addEventListener('input', filterCustomers);
    filterSelect.addEventListener('change', filterCustomers);
}

// Setup rewards tab functionality
function setupRewardsTab() {
    const tabButtons = document.querySelectorAll('.rewards-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.rewards-tab-content');

    if (tabButtons.length === 0) {
        console.warn('No rewards tab buttons found');
        return;
    }

    tabButtons.forEach(button => {
        // Remove existing event listeners to prevent duplicates
        button.removeEventListener('click', handleRewardsTabClick);
        button.addEventListener('click', handleRewardsTabClick);
    });
}

// Handle rewards tab click
function handleRewardsTabClick(event) {
    const button = event.currentTarget;
    const targetTab = button.getAttribute('data-tab');

    if (!targetTab) {
        console.warn('No data-tab attribute found on button');
        return;
    }

    // Update active tab button
    document.querySelectorAll('.rewards-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');

    // Update active tab content
    document.querySelectorAll('.rewards-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetContent = document.getElementById(targetTab);
    if (targetContent) {
        targetContent.classList.add('active');

        // Load content based on tab
        switch(targetTab) {
            case 'available-rewards':
                loadRewardsList();
                break;
            case 'claimed-rewards':
                loadClaimedRewards();
                break;
            case 'reward-criteria':
                loadRewardCriteria();
                break;
        }
    } else {
        console.warn(`Target content element not found: ${targetTab}`);
    }
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
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-gift"></i></div>
                <div class="empty-state-title">No rewards yet</div>
                <div class="empty-state-description">Create your first reward to start offering incentives to customers.</div>
                <button class="btn btn-primary" onclick="showAddRewardModal()">
                    <i class="fas fa-plus"></i>
                    Add First Reward
                </button>
            </div>
        `;
        return;
    }

    const html = rewards.map(reward => `
        <div class="bg-white rounded-xl border-2 border-gray-200 transition-all duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-1 overflow-hidden" data-animate="fade-in">
            <div class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div class="w-12 h-12 bg-gradient-to-br from-primary-orange to-primary-pink rounded-full flex items-center justify-center text-white">
                    <i class="fas fa-gift text-xl"></i>
                </div>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${reward.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">
                    <i class="fas fa-${reward.isActive ? 'check-circle' : 'pause-circle'} mr-1"></i>
                    ${reward.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>

            <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-900 mb-3">${reward.title}</h3>
                <p class="text-gray-600 text-sm leading-relaxed mb-4">${reward.description}</p>

                <div class="space-y-3 mb-6">
                    <div class="flex justify-between items-center py-2 border-b border-gray-100">
                        <span class="text-sm text-gray-500 font-medium">Category</span>
                        <span class="flex items-center text-sm text-gray-700 font-semibold">
                            <i class="fas fa-tag mr-2"></i>
                            ${reward.category.replace('_', ' ')}
                        </span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-100">
                        <span class="text-sm text-gray-500 font-medium">Value</span>
                        <span class="flex items-center text-sm text-gray-700 font-semibold">
                            <i class="fas fa-dollar-sign mr-2"></i>
                            ${reward.value}
                        </span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm text-gray-500 font-medium">Points Required</span>
                        <span class="flex items-center text-sm text-primary font-bold">
                            <i class="fas fa-coins mr-2"></i>
                            ${reward.pointsRequired} pts
                        </span>
                    </div>
                </div>
            </div>

            <div class="flex gap-2 p-4 bg-gray-50 border-t border-gray-200">
                <button class="btn btn-outline btn-sm flex-1" onclick="editReward('${reward._id}')" title="Edit Reward">
                    <i class="fas fa-edit mr-1"></i>
                    Edit
                </button>
                <button class="btn btn-outline btn-sm flex-1" onclick="toggleRewardStatus('${reward._id}')" title="Toggle Status">
                    <i class="fas fa-${reward.isActive ? 'pause' : 'play'} mr-1"></i>
                    ${reward.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn btn-outline btn-sm flex-1 hover:bg-red-600 hover:border-red-600 hover:text-white" onclick="deleteReward('${reward._id}')" title="Delete Reward">
                    <i class="fas fa-trash mr-1"></i>
                    Delete
                </button>
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
    const container = document.getElementById('customers-table');

    if (!container) {
        console.error('customers-table container not found');
        return;
    }

    if (!customers || customers.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-users"></i></div><div class="empty-state-title">No customers yet</div></div>';
        return;
    }

    const html = `
        <div class="overflow-x-auto">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Contact</th>
                        <th>Points</th>
                        <th>Visits</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.map(customer => `
                        <tr class="hover:bg-gray-50 transition-colors" data-animate="fade-in">
                            <td>
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 bg-primary-orange/20 rounded-full flex items-center justify-center">
                                        <i class="fas fa-user text-primary-orange"></i>
                                    </div>
                                    <div>
                                        <div class="font-medium text-gray-900">${customer.firstName} ${customer.lastName}</div>
                                        <div class="text-sm text-gray-500">Joined ${Utils.formatDateOnly(customer.joinDate)}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="text-sm">
                                    <div class="flex items-center text-gray-900">
                                        <i class="fas fa-phone mr-2 text-gray-400"></i>
                                        ${customer.phone}
                                    </div>
                                    ${customer.email ? `
                                        <div class="flex items-center text-gray-500 mt-1">
                                            <i class="fas fa-envelope mr-2 text-gray-400"></i>
                                            ${customer.email}
                                        </div>
                                    ` : ''}
                                </div>
                            </td>
                            <td>
                                <div class="text-sm">
                                    <div class="font-semibold text-primary">${Utils.formatPoints(customer.availablePoints)} available</div>
                                    <div class="text-gray-500">${Utils.formatPoints(customer.totalPoints)} total</div>
                                </div>
                            </td>
                            <td>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <i class="fas fa-calendar-check mr-1"></i>
                                    ${customer.totalVisits}
                                </span>
                            </td>
                            <td>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                    <i class="fas fa-${customer.isActive ? 'check-circle' : 'pause-circle'} mr-1"></i>
                                    ${customer.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td>
                                <div class="flex space-x-2">
                                    <button class="btn btn-outline btn-sm" onclick="viewCustomerDetails('${customer._id}')" title="View Details">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-primary btn-sm" onclick="awardPointsToCustomer('${customer._id}', '${customer.firstName} ${customer.lastName}')" title="Award Points">
                                        <i class="fas fa-star"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

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

// Load claimed rewards
function loadClaimedRewards() {
    const container = document.getElementById('claimed-rewards-table');
    if (!container) return;

    Utils.showLoading(container, 'Loading claimed rewards...');

    Utils.apiRequest('/api/business/claimed-rewards')
        .then(data => {
            if (data.success) {
                displayClaimedRewards(data.data.claims);
            } else {
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-history"></i></div><div class="empty-state-title">No claimed rewards</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading claimed rewards:', error);
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-state-title">Error loading claimed rewards</div></div>';
        });
}

// Display claimed rewards table
function displayClaimedRewards(claims) {
    const container = document.getElementById('claimed-rewards-table');

    if (!claims || claims.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-history"></i></div><div class="empty-state-title">No claimed rewards yet</div></div>';
        return;
    }

    const html = `
        <table class="claimed-rewards-table">
            <thead>
                <tr>
                    <th>Reward</th>
                    <th>Customer</th>
                    <th>Points Used</th>
                    <th>Date Claimed</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${claims.map(claim => `
                    <tr>
                        <td>
                            <div class="reward-info">
                                <div class="reward-icon">
                                    <i class="fas fa-gift"></i>
                                </div>
                                <div>
                                    <h4>${claim.reward.name}</h4>
                                    <p>${claim.reward.description}</p>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div>
                                <div>${claim.customer.firstName} ${claim.customer.lastName}</div>
                                <div style="font-size: 0.75rem; color: var(--gray-500);">
                                    ${claim.customer.phone}
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="points-display">${Utils.formatPoints(claim.pointsUsed)}</span>
                        </td>
                        <td>${Utils.formatDate(claim.claimedAt)}</td>
                        <td>
                            <span class="status-badge active">Claimed</span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// Load reward criteria
function loadRewardCriteria() {
    const container = document.getElementById('criteria-list');
    if (!container) return;

    Utils.showLoading(container, 'Loading criteria...');

    Utils.apiRequest('/api/business/criteria')
        .then(data => {
            if (data.success) {
                displayRewardCriteria(data.data.criteria);
            } else {
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-cogs"></i></div><div class="empty-state-title">No criteria found</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading criteria:', error);
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-state-title">Error loading criteria</div></div>';
        });
}

// Display reward criteria
function displayRewardCriteria(criteria) {
    const container = document.getElementById('criteria-list');

    if (!criteria || criteria.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-cogs"></i></div>
                <div class="empty-state-title">No criteria set</div>
                <div class="empty-state-description">Set up point earning criteria for your customers.</div>
                <button class="btn btn-primary" onclick="showAddCriteriaModal()">
                    <i class="fas fa-plus"></i>
                    Add First Criteria
                </button>
            </div>
        `;
        return;
    }

    const html = criteria.map(criterion => `
        <div class="criteria-item">
            <div class="criteria-info">
                <h4>${criterion.name}</h4>
                <p>${criterion.description}</p>
            </div>
            <div class="criteria-points">
                +${criterion.points}
            </div>
            <div class="criteria-actions">
                <button class="action-btn edit" onclick="editCriteria('${criterion._id}')" title="Edit Criteria">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteCriteria('${criterion._id}')" title="Delete Criteria">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Make functions globally available
window.initializeBusinessDashboard = initializeBusinessDashboard;
window.refreshDashboard = refreshDashboard;
window.refreshCodes = refreshCodes;
window.setupRewardsTab = setupRewardsTab;
window.loadClaimedRewards = loadClaimedRewards;
window.loadRewardCriteria = loadRewardCriteria;
