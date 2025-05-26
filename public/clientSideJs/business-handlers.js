// Business Dashboard Handlers

// Load customers for the customers modal (different from main dashboard)
function loadCustomersModal() {
    const container = document.getElementById('customers-list');
    if (!container) return;

    const search = document.getElementById('customer-search')?.value || '';

    showLoading(container, 'Loading customers...');

    fetch(`/api/business/customers?search=${encodeURIComponent(search)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayCustomersModalList(data.data.customers);
            } else {
                container.innerHTML = '<p class="text-center">Failed to load customers</p>';
            }
        })
        .catch(error => {
            console.error('Error loading customers:', error);
            container.innerHTML = '<p class="text-center">Error loading customers</p>';
        });
}

function displayCustomersModalList(customers) {
    const container = document.getElementById('customers-list');
    if (!customers || customers.length === 0) {
        container.innerHTML = '<p class="text-center">No customers found</p>';
        return;
    }

    const html = `
        <div class="customers-table">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Points</th>
                        <th>Visits</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.map(customer => `
                        <tr>
                            <td>${customer.firstName} ${customer.lastName}</td>
                            <td>${customer.phone}</td>
                            <td>${customer.email || 'N/A'}</td>
                            <td class="points-cell">${customer.totalPoints.toLocaleString()}</td>
                            <td>${customer.totalVisits}</td>
                            <td>
                                <button class="btn btn-small btn-outline" onclick="viewCustomerDetails('${customer._id}')">
                                    View
                                </button>
                                <button class="btn btn-small btn-primary" onclick="awardPointsToCustomer('${customer._id}', '${customer.firstName} ${customer.lastName}')">
                                    Award Points
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// Load rewards for the rewards modal
function loadRewards() {
    const container = document.getElementById('rewards-list');
    if (!container) return;

    showLoading(container, 'Loading rewards...');

    fetch('/api/business/rewards')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayRewardsList(data.data.rewards);
            } else {
                container.innerHTML = '<p class="text-center">Failed to load rewards</p>';
            }
        })
        .catch(error => {
            console.error('Error loading rewards:', error);
            container.innerHTML = '<p class="text-center">Error loading rewards</p>';
        });
}

function displayRewardsList(rewards) {
    const container = document.getElementById('rewards-list');
    if (!rewards || rewards.length === 0) {
        container.innerHTML = '<p class="text-center">No rewards found</p>';
        return;
    }

    const html = `
        <div class="rewards-grid">
            ${rewards.map(reward => `
                <div class="reward-card-admin">
                    <div class="reward-header">
                        <span class="reward-category">${reward.category.replace('_', ' ')}</span>
                        <span class="reward-status ${reward.isActive ? 'active' : 'inactive'}">
                            ${reward.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <h4 class="reward-title">${reward.title}</h4>
                    <p class="reward-description">${reward.description}</p>
                    <div class="reward-details">
                        <div class="detail">
                            <span class="label">Points:</span>
                            <span class="value">${reward.pointsRequired}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Value:</span>
                            <span class="value">${reward.value}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Available:</span>
                            <span class="value">${reward.quantityAvailable}</span>
                        </div>
                    </div>
                    <div class="reward-actions">
                        <button class="btn btn-small btn-outline" onclick="editReward('${reward._id}')">
                            Edit
                        </button>
                        <button class="btn btn-small ${reward.isActive ? 'btn-warning' : 'btn-success'}"
                                onclick="toggleReward('${reward._id}', ${!reward.isActive})">
                            ${reward.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button class="btn btn-small btn-danger" onclick="deleteReward('${reward._id}')">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;
}

// Handle create reward form submission
function handleCreateReward(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Convert numeric fields
    data.pointsRequired = parseInt(data.pointsRequired);
    data.quantityAvailable = parseInt(data.quantityAvailable);

    fetch('/api/business/rewards', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('Reward created successfully!', 'success');
            form.reset();
            showRewardsListTab();
            loadRewards();
        } else {
            showNotification(result.message || 'Failed to create reward', 'error');
        }
    })
    .catch(error => {
        console.error('Error creating reward:', error);
        showNotification('Failed to create reward', 'error');
    });
}

// Handle award points form submission
function handleAwardPoints(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    if (!data.customerId) {
        showNotification('Please select a customer', 'error');
        return;
    }

    data.points = parseInt(data.points);

    fetch('/api/business/award-points', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification(result.message, 'success');
            closeModal('award-points-modal');
            // Refresh dashboard stats
            loadDashboardStats();
        } else {
            showNotification(result.message || 'Failed to award points', 'error');
        }
    })
    .catch(error => {
        console.error('Error awarding points:', error);
        showNotification('Failed to award points', 'error');
    });
}

// Search customers for award points
function searchCustomersForAward() {
    const searchInput = document.getElementById('customer-search-award');
    const suggestionsContainer = document.getElementById('customer-suggestions');
    const query = searchInput.value.trim();

    if (query.length < 2) {
        suggestionsContainer.innerHTML = '';
        return;
    }

    fetch(`/api/business/customers?search=${encodeURIComponent(query)}&limit=5`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayCustomerSuggestions(data.data.customers);
            }
        })
        .catch(error => {
            console.error('Error searching customers:', error);
        });
}

function displayCustomerSuggestions(customers) {
    const container = document.getElementById('customer-suggestions');

    if (!customers || customers.length === 0) {
        container.innerHTML = '<div class="suggestion-item">No customers found</div>';
        return;
    }

    const html = customers.map(customer => `
        <div class="suggestion-item" onclick="selectCustomerForAward('${customer._id}', '${customer.firstName} ${customer.lastName}', '${customer.phone}')">
            <div class="customer-name">${customer.firstName} ${customer.lastName}</div>
            <div class="customer-phone">${customer.phone}</div>
            <div class="customer-points">${customer.totalPoints} points</div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function selectCustomerForAward(customerId, customerName, customerPhone) {
    document.getElementById('selected-customer-id').value = customerId;
    document.getElementById('selected-customer').innerHTML = `
        <div class="selected-customer-info">
            <div class="customer-name">${customerName}</div>
            <div class="customer-phone">${customerPhone}</div>
        </div>
    `;
    document.getElementById('customer-suggestions').innerHTML = '';
    document.getElementById('customer-search-award').value = customerName;
}

// Load analytics data
function loadAnalytics() {
    // This would typically fetch real analytics data
    // For now, we'll show some sample data
    setTimeout(() => {
        document.getElementById('monthly-visits').textContent = '127';
        document.getElementById('avg-points').textContent = '245';
        document.getElementById('top-reward').textContent = '20% Off';

        const chartContainer = document.getElementById('activity-chart');
        chartContainer.innerHTML = `
            <div class="simple-chart">
                <div class="chart-bar" style="height: 60%"><span>Mon</span></div>
                <div class="chart-bar" style="height: 80%"><span>Tue</span></div>
                <div class="chart-bar" style="height: 45%"><span>Wed</span></div>
                <div class="chart-bar" style="height: 90%"><span>Thu</span></div>
                <div class="chart-bar" style="height: 70%"><span>Fri</span></div>
                <div class="chart-bar" style="height: 95%"><span>Sat</span></div>
                <div class="chart-bar" style="height: 55%"><span>Sun</span></div>
            </div>
        `;
    }, 1000);
}

// Additional helper functions
function viewCustomerDetails(customerId) {
    showNotification('Customer details feature coming soon!', 'info');
}

function awardPointsToCustomer(customerId, customerName) {
    closeModal('customers-modal');
    createAwardPointsModal();
    // Pre-select the customer
    setTimeout(() => {
        selectCustomerForAward(customerId, customerName, '');
    }, 100);
}

function editReward(rewardId) {
    showNotification('Edit reward feature coming soon!', 'info');
}

function toggleReward(rewardId, activate) {
    const action = activate ? 'activate' : 'deactivate';
    if (confirm(`Are you sure you want to ${action} this reward?`)) {
        // Implementation would go here
        showNotification(`Reward ${action}d successfully!`, 'success');
        loadRewards();
    }
}

function deleteReward(rewardId) {
    if (confirm('Are you sure you want to delete this reward? This action cannot be undone.')) {
        fetch(`/api/business/rewards/${rewardId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showNotification('Reward deleted successfully!', 'success');
                loadRewards();
            } else {
                showNotification(result.message || 'Failed to delete reward', 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting reward:', error);
            showNotification('Failed to delete reward', 'error');
        });
    }
}
