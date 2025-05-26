// Rewards Management for Fades n Braids

// Initialize rewards functionality
function initializeRewards() {
    loadRewards();
    initializeRewardTabs();
}

// Load available rewards
function loadRewards() {
    const container = document.getElementById('rewards-grid');
    if (!container) return;

    Utils.showLoading(container, 'Loading available rewards...');

    Utils.apiRequest('/api/customers/rewards')
        .then(data => {
            if (data.success) {
                displayRewards(data.data.rewards);
            } else {
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-gift"></i></div><div class="empty-state-title">No rewards available</div><div class="empty-state-description">Check back later for new rewards!</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading rewards:', error);
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-state-title">Error loading rewards</div><div class="empty-state-description">Please try again later.</div></div>';
        });
}

// Display rewards with FontAwesome icons (Customer Dashboard)
function displayRewards(rewards) {
    const container = document.getElementById('rewards-grid');
    if (!rewards || rewards.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-gift"></i></div><div class="empty-state-title">No rewards available</div><div class="empty-state-description">You don\'t have enough points for any rewards yet. Keep earning!</div></div>';
        return;
    }

    const categoryIcons = {
        discount: 'fas fa-percentage',
        free_service: 'fas fa-cut',
        product: 'fas fa-box',
        special_offer: 'fas fa-star'
    };

    const html = rewards.map(reward => `
        <div class="customer-reward-card" data-animate="fade-in">
            <div class="customer-reward-header">
                <span class="customer-reward-category">
                    <i class="${categoryIcons[reward.category] || 'fas fa-gift'}"></i>
                    ${reward.category.replace('_', ' ')}
                </span>
                <span class="customer-reward-points">
                    <i class="fas fa-coins"></i>
                    ${reward.pointsRequired} pts
                </span>
            </div>
            <h3 class="customer-reward-title">${reward.title}</h3>
            <p class="customer-reward-description">${reward.description}</p>
            <div class="customer-reward-value">
                <i class="fas fa-tag"></i>
                ${reward.value}
            </div>
            <button class="btn btn-primary customer-reward-btn" onclick="redeemReward('${reward._id}')" data-reward-id="${reward._id}">
                <i class="fas fa-hand-holding-heart"></i>
                Redeem Now
            </button>
        </div>
    `).join('');

    container.innerHTML = html;

    // Initialize animations for new elements
    Animations.initializeAnimations();
}

// Redeem reward with enhanced UX
function redeemReward(rewardId) {
    showConfirmation(
        'Are you sure you want to redeem this reward? This action cannot be undone.',
        () => {
            const button = document.querySelector(`[data-reward-id="${rewardId}"]`);
            const originalText = button.innerHTML;

            // Show loading state
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redeeming...';
            button.disabled = true;

            Utils.apiRequest(`/api/customers/rewards/${rewardId}/redeem`, {
                method: 'POST'
            })
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');

                    // Update points display immediately
                    updatePointsDisplay(data.data.remainingPoints);

                    // Refresh rewards and claimed rewards
                    loadRewards();
                    updateClaimedRewardsCount();

                    // Show celebration animation
                    showRewardCelebration();
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Redeem error:', error);
                showNotification('Redemption failed. Please try again.', 'error');
            })
            .finally(() => {
                // Restore button state
                button.innerHTML = originalText;
                button.disabled = false;
            });
        }
    );
}

// Update points display with animation
function updatePointsDisplay(newPoints) {
    const pointsElement = document.querySelector('.points-number');
    if (pointsElement) {
        // Add update animation
        pointsElement.style.transform = 'scale(1.2)';
        pointsElement.style.color = 'var(--success)';

        setTimeout(() => {
            pointsElement.textContent = Utils.formatPoints(newPoints);
            pointsElement.style.transform = 'scale(1)';
            pointsElement.style.color = '';
        }, 200);
    }
}

// Show reward celebration animation
function showRewardCelebration() {
    const celebration = document.createElement('div');
    celebration.className = 'reward-celebration';
    celebration.innerHTML = `
        <div class="celebration-content">
            <i class="fas fa-trophy celebration-icon"></i>
            <h3>Reward Claimed!</h3>
            <p>Congratulations on your redemption!</p>
        </div>
    `;

    celebration.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    document.body.appendChild(celebration);

    setTimeout(() => {
        celebration.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => celebration.remove(), 300);
    }, 2000);
}

// Rewards tab switching
function showRewardsTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.rewards-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Update tab content with animation
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetContent = document.getElementById(`${tabName}-rewards-tab`);
    targetContent.classList.add('active');

    // Load content if needed
    if (tabName === 'claimed') {
        loadClaimedRewards();
    } else if (tabName === 'available') {
        loadRewards();
    }
}

// Load claimed rewards
function loadClaimedRewards() {
    const container = document.getElementById('claimed-rewards-grid');
    if (!container) return;

    Utils.showLoading(container, 'Loading claimed rewards...');

    Utils.apiRequest('/api/customers/rewards/claimed')
        .then(data => {
            if (data.success) {
                displayClaimedRewards(data.data.claimedRewards);
            } else {
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-gift"></i></div><div class="empty-state-title">No claimed rewards</div><div class="empty-state-description">You haven\'t claimed any rewards yet. Check out the available rewards to start earning!</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading claimed rewards:', error);
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-state-title">Error loading rewards</div><div class="empty-state-description">Please try again later.</div></div>';
        });
}

// Display claimed rewards
function displayClaimedRewards(claimedRewards) {
    const container = document.getElementById('claimed-rewards-grid');

    if (!claimedRewards || claimedRewards.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-gift"></i></div><div class="empty-state-title">No claimed rewards</div><div class="empty-state-description">You haven\'t claimed any rewards yet. Check out the available rewards to start earning!</div></div>';
        return;
    }

    const html = claimedRewards.map(reward => `
        <div class="claimed-reward-card" data-animate="fade-in">
            <div class="claimed-reward-header">
                <div class="claimed-reward-status">
                    <i class="fas fa-check-circle"></i>
                    Claimed
                </div>
            </div>
            <div class="claimed-reward-date">
                <i class="fas fa-calendar-alt"></i>
                Claimed on ${Utils.formatDateOnly(reward.redeemedAt)}
            </div>
            <h3 class="claimed-reward-title">${reward.title}</h3>
            <p class="claimed-reward-description">${reward.description}</p>
            <div class="claimed-reward-details">
                <div class="claimed-reward-value">
                    <i class="fas fa-tag"></i>
                    ${reward.value}
                </div>
                <div class="claimed-reward-points">
                    <i class="fas fa-coins"></i>
                    ${reward.pointsUsed} points used
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;

    // Initialize animations for new elements
    Animations.initializeAnimations();
}

// Update claimed rewards count
function updateClaimedRewardsCount() {
    Utils.apiRequest('/api/customers/rewards/claimed')
        .then(data => {
            if (data.success) {
                const countElement = document.getElementById('claimed-count');
                if (countElement) {
                    countElement.textContent = data.data.totalClaimed;
                }
            }
        })
        .catch(error => {
            console.error('Error updating claimed rewards count:', error);
        });
}

// Initialize reward tabs
function initializeRewardTabs() {
    const tabButtons = document.querySelectorAll('.rewards-tabs .tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.id.replace('-tab', '');
            showRewardsTab(tabName);
        });
    });
}

// Show reward criteria information
function showRewardCriteria() {
    const modal = document.createElement('div');
    modal.className = 'modal reward-criteria-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-info-circle"></i> Reward Criteria</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="criteria-section">
                    <h4><i class="fas fa-coins"></i> How to Earn Points</h4>
                    <ul>
                        <li><i class="fas fa-check"></i> Check-in at the salon: <strong>10 points</strong></li>
                        <li><i class="fas fa-check"></i> Welcome bonus: <strong>50 points</strong></li>
                        <li><i class="fas fa-check"></i> Special promotions: <strong>Varies</strong></li>
                    </ul>
                </div>
                <div class="criteria-section">
                    <h4><i class="fas fa-gift"></i> Reward Categories</h4>
                    <ul>
                        <li><i class="fas fa-percentage"></i> <strong>Discounts:</strong> Percentage off services</li>
                        <li><i class="fas fa-cut"></i> <strong>Free Services:</strong> Complimentary treatments</li>
                        <li><i class="fas fa-box"></i> <strong>Products:</strong> Hair care products</li>
                        <li><i class="fas fa-star"></i> <strong>Special Offers:</strong> Exclusive deals</li>
                    </ul>
                </div>
                <div class="criteria-section">
                    <h4><i class="fas fa-exclamation-triangle"></i> Important Notes</h4>
                    <ul>
                        <li><i class="fas fa-info"></i> Points expire after 12 months of inactivity</li>
                        <li><i class="fas fa-info"></i> Rewards cannot be combined with other offers</li>
                        <li><i class="fas fa-info"></i> Some rewards have limited availability</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.classList.add('show');

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Export rewards functions
window.Rewards = {
    initializeRewards,
    loadRewards,
    loadClaimedRewards,
    redeemReward,
    showRewardsTab,
    showRewardCriteria,
    updateClaimedRewardsCount
};

// Make functions globally available
window.loadRewards = loadRewards;
window.redeemReward = redeemReward;
window.showRewardsTab = showRewardsTab;
window.showRewardCriteria = showRewardCriteria;
