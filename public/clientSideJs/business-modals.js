// Business Dashboard Modals

// Customers Modal
function createCustomersModal() {
    const modal = createModal('customers-modal', 'Customer Management', `
        <div class="modal-tabs">
            <button class="tab-btn active" onclick="showCustomersTab()">All Customers</button>
            <button class="tab-btn" onclick="showSearchTab()">Search</button>
        </div>
        <div class="modal-content-body">
            <div id="customers-tab" class="tab-content active">
                <div class="customers-controls">
                    <input type="text" id="customer-search" placeholder="Search customers..." class="form-input">
                    <button class="btn btn-primary" onclick="loadCustomers()">Refresh</button>
                </div>
                <div id="customers-list" class="customers-list">
                    <div class="loading">Loading customers...</div>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    modal.classList.add('show');
    loadCustomers();
}

// Rewards Modal
function createRewardsModal() {
    const modal = createModal('rewards-modal', 'Rewards Management', `
        <div class="modal-tabs">
            <button class="tab-btn active" onclick="showRewardsListTab()">All Rewards</button>
            <button class="tab-btn" onclick="showCreateRewardTab()">Create New</button>
        </div>
        <div class="modal-content-body">
            <div id="rewards-list-tab" class="tab-content active">
                <div id="rewards-list" class="rewards-list">
                    <div class="loading">Loading rewards...</div>
                </div>
            </div>
            <div id="create-reward-tab" class="tab-content">
                <form id="create-reward-form" class="reward-form">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" name="title" required class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="description" required class="form-input"></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Points Required</label>
                            <input type="number" name="pointsRequired" required class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Value</label>
                            <input type="text" name="value" required class="form-input">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Category</label>
                            <select name="category" required class="form-input">
                                <option value="discount">Discount</option>
                                <option value="free_service">Free Service</option>
                                <option value="product">Product</option>
                                <option value="special_offer">Special Offer</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Quantity Available</label>
                            <input type="number" name="quantityAvailable" value="1" class="form-input">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Create Reward</button>
                        <button type="button" class="btn btn-ghost" onclick="closeModal('rewards-modal')">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    modal.classList.add('show');
    loadRewards();
    
    // Handle form submission
    const form = modal.querySelector('#create-reward-form');
    form.addEventListener('submit', handleCreateReward);
}

// Award Points Modal
function createAwardPointsModal() {
    const modal = createModal('award-points-modal', 'Award Points to Customer', `
        <form id="award-points-form" class="award-points-form">
            <div class="form-group">
                <label>Search Customer</label>
                <input type="text" id="customer-search-award" placeholder="Search by name or phone..." class="form-input">
                <div id="customer-suggestions" class="suggestions-list"></div>
            </div>
            <div class="form-group">
                <label>Selected Customer</label>
                <div id="selected-customer" class="selected-customer">
                    <span class="placeholder">No customer selected</span>
                </div>
                <input type="hidden" id="selected-customer-id" name="customerId">
            </div>
            <div class="form-group">
                <label>Points to Award</label>
                <input type="number" name="points" min="1" required class="form-input">
            </div>
            <div class="form-group">
                <label>Reason (Optional)</label>
                <textarea name="reason" placeholder="Reason for awarding points..." class="form-input"></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Award Points</button>
                <button type="button" class="btn btn-ghost" onclick="closeModal('award-points-modal')">Cancel</button>
            </div>
        </form>
    `);
    
    document.body.appendChild(modal);
    modal.classList.add('show');
    
    // Handle form submission
    const form = modal.querySelector('#award-points-form');
    form.addEventListener('submit', handleAwardPoints);
    
    // Handle customer search
    const searchInput = modal.querySelector('#customer-search-award');
    searchInput.addEventListener('input', debounce(searchCustomersForAward, 300));
}

// Analytics Modal
function createAnalyticsModal() {
    const modal = createModal('analytics-modal', 'Business Analytics', `
        <div class="analytics-dashboard">
            <div class="analytics-stats">
                <div class="stat-card">
                    <h4>This Month</h4>
                    <div class="stat-value" id="monthly-visits">-</div>
                    <div class="stat-label">Visits</div>
                </div>
                <div class="stat-card">
                    <h4>Average Points</h4>
                    <div class="stat-value" id="avg-points">-</div>
                    <div class="stat-label">Per Customer</div>
                </div>
                <div class="stat-card">
                    <h4>Top Reward</h4>
                    <div class="stat-value" id="top-reward">-</div>
                    <div class="stat-label">Most Redeemed</div>
                </div>
            </div>
            <div class="analytics-charts">
                <div class="chart-container">
                    <h4>Recent Activity</h4>
                    <div id="activity-chart" class="chart">
                        <div class="loading">Loading analytics...</div>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    modal.classList.add('show');
    loadAnalytics();
}

// Helper function to create modal structure
function createModal(id, title, content) {
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal business-modal';
    modal.innerHTML = `
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal('${id}')">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    return modal;
}

// Close modal function
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

// Tab switching functions
function showCustomersTab() {
    switchTab('customers-tab');
}

function showSearchTab() {
    switchTab('search-tab');
}

function showRewardsListTab() {
    switchTab('rewards-list-tab');
}

function showCreateRewardTab() {
    switchTab('create-reward-tab');
}

function switchTab(activeTabId) {
    // Remove active class from all tabs and buttons
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to selected tab
    const activeTab = document.getElementById(activeTabId);
    if (activeTab) {
        activeTab.classList.add('active');
        // Find and activate corresponding button
        const tabIndex = Array.from(activeTab.parentNode.children).indexOf(activeTab);
        const buttons = document.querySelectorAll('.tab-btn');
        if (buttons[tabIndex]) {
            buttons[tabIndex].classList.add('active');
        }
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
