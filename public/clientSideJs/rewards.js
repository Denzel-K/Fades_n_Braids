// Rewards Management for Fades n Braids

// Initialize rewards functionality
function initializeRewards() {
    console.log('Initializing rewards system...');
    loadRewards();
    updateClaimedRewardsCount();
    initializeRewardTabs();

    // Ensure the available tab is shown by default
    showRewardsTab('available');
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
        container.innerHTML = `
            <div class="empty-state col-span-full">
                <div class="empty-state-icon">
                    <i class="fas fa-gift"></i>
                </div>
                <div class="empty-state-title">No rewards available</div>
                <div class="empty-state-description">You don't have enough points for any rewards yet. Keep earning!</div>
            </div>
        `;
        return;
    }

    const categoryIcons = {
        discount: 'fas fa-percentage',
        free_service: 'fas fa-cut',
        product: 'fas fa-box',
        special_offer: 'fas fa-star'
    };

    const html = rewards.map(reward => `
        <div class="bg-white rounded-xl border-2 border-gray-200 p-6 transition-all duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-1 relative overflow-hidden" data-animate="fade-in">
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-orange to-primary-pink"></div>
            <div class="flex justify-between items-center mb-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    <i class="${categoryIcons[reward.category] || 'fas fa-gift'} mr-1"></i>
                    ${reward.category.replace('_', ' ')}
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary text-white">
                    <i class="fas fa-coins mr-1"></i>
                    ${reward.pointsRequired} pts
                </span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">${reward.title}</h3>
            <p class="text-gray-600 text-sm leading-relaxed mb-4">${reward.description}</p>
            <div class="flex items-center text-success font-semibold mb-6">
                <i class="fas fa-tag mr-2"></i>
                ${reward.value}
            </div>
            <button class="btn btn-primary btn-full" onclick="redeemReward('${reward._id}')" data-reward-id="${reward._id}">
                <i class="fas fa-hand-holding-heart mr-2"></i>
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

                    // If we're currently viewing claimed rewards, refresh that too
                    const claimedTab = document.getElementById('claimed-rewards-tab');
                    if (claimedTab && !claimedTab.classList.contains('hidden')) {
                        setTimeout(() => {
                            loadClaimedRewards();
                        }, 1000); // Small delay to allow backend to process
                    }

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
    console.log('Switching to rewards tab:', tabName);

    // Update tab buttons with Tailwind classes
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-white', 'text-primary-orange', 'shadow-sm');
        btn.classList.add('text-gray-600', 'hover:text-gray-900');
    });

    const activeButton = document.getElementById(`${tabName}-tab`);
    if (activeButton) {
        activeButton.classList.add('active', 'bg-white', 'text-primary-orange', 'shadow-sm');
        activeButton.classList.remove('text-gray-600', 'hover:text-gray-900');
        console.log('Activated button:', activeButton.id);
    } else {
        console.warn('Button not found:', `${tabName}-tab`);
    }

    // Update tab content with proper hiding/showing
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('active');
    });

    const targetContent = document.getElementById(`${tabName}-rewards-tab`);
    if (targetContent) {
        targetContent.classList.remove('hidden');
        targetContent.classList.add('active');
        console.log('Activated content:', targetContent.id);
    } else {
        console.warn('Content not found:', `${tabName}-rewards-tab`);
    }

    // Load content if needed
    if (tabName === 'claimed') {
        console.log('Loading claimed rewards...');
        loadClaimedRewards();
    } else if (tabName === 'available') {
        console.log('Loading available rewards...');
        // Use the function from main.js that shows ALL rewards for motivation
        if (typeof loadAvailableRewards === 'function') {
            loadAvailableRewards();
        } else {
            loadRewards();
        }
    }
}

// Load claimed rewards
function loadClaimedRewards() {
    const container = document.getElementById('claimed-rewards-grid');
    if (!container) {
        console.error('claimed-rewards-grid container not found!');
        return;
    }

    console.log('Loading claimed rewards...');

    // Show loading state with Tailwind classes
    container.innerHTML = `
        <div class="flex items-center justify-center py-12 col-span-full">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange mr-3"></div>
            <span class="text-gray-600">Loading claimed rewards...</span>
        </div>
    `;

    Utils.apiRequest('/api/customers/rewards/claimed')
        .then(data => {
            console.log('=== CLAIMED REWARDS API RESPONSE ===');
            console.log('Full response:', data);
            console.log('Success:', data.success);
            console.log('Data object:', data.data);

            if (data.data && data.data.claimedRewards) {
                console.log('Claimed rewards array:', data.data.claimedRewards);
                console.log('Number of claimed rewards:', data.data.claimedRewards.length);
                console.log('Total claimed count:', data.data.totalClaimed);
            }

            if (data.success && data.data && data.data.claimedRewards && data.data.claimedRewards.length > 0) {
                console.log('Displaying claimed rewards...');
                displayClaimedRewards(data.data.claimedRewards);
            } else {
                console.log('No claimed rewards to display');
                console.log('Reasons: success =', data.success, ', data =', !!data.data, ', claimedRewards =', data.data?.claimedRewards, ', length =', data.data?.claimedRewards?.length);
                container.innerHTML = `
                    <div class="text-center py-12 col-span-full">
                        <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-gift text-gray-400 text-2xl"></i>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">No claimed rewards</h3>
                        <p class="text-gray-600">Redeem your first reward to see it here!</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading claimed rewards:', error);
            container.innerHTML = `
                <div class="text-center py-12 col-span-full">
                    <div class="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Error loading rewards</h3>
                    <p class="text-gray-600">Please try again later.</p>
                </div>
            `;
        });
}

// Display claimed rewards
function displayClaimedRewards(claimedRewards) {
    console.log('=== DISPLAY CLAIMED REWARDS ===');
    console.log('Received claimedRewards:', claimedRewards);
    console.log('Type:', typeof claimedRewards);
    console.log('Is array:', Array.isArray(claimedRewards));
    console.log('Length:', claimedRewards?.length);

    const container = document.getElementById('claimed-rewards-grid');
    if (!container) {
        console.error('claimed-rewards-grid container not found in displayClaimedRewards!');
        return;
    }

    if (!claimedRewards || claimedRewards.length === 0) {
        console.log('No claimed rewards to display - showing empty state');
        container.innerHTML = `
            <div class="text-center py-12 col-span-full">
                <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-gift text-gray-400 text-2xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No claimed rewards</h3>
                <p class="text-gray-600">You haven't claimed any rewards yet. Check out the available rewards to start earning!</p>
            </div>
        `;
        return;
    }

    console.log('Processing', claimedRewards.length, 'claimed rewards for display');

    const categoryIcons = {
        discount: 'fas fa-percentage',
        free_service: 'fas fa-cut',
        product: 'fas fa-box',
        special_offer: 'fas fa-star'
    };

    const html = claimedRewards.map((reward, index) => {
        console.log(`Processing reward ${index}:`, reward);

        // The API flattens the rewardId properties to the top level
        const categoryDisplay = reward.category ? reward.category.replace('_', ' ') : 'General';
        const categoryIcon = categoryIcons[reward.category] || 'fas fa-gift';

        return `
        <div class="bg-white rounded-xl border border-gray-200 p-6 relative hover:shadow-md transition-shadow" data-animate="fade-in" data-delay="${index * 100}">
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
            <div class="absolute top-4 right-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <i class="fas fa-check-circle mr-1"></i>
                    Claimed
                </span>
            </div>
            <div class="mb-4">
                <div class="flex items-center justify-between">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <i class="${categoryIcon} mr-1"></i>
                        ${categoryDisplay}
                    </span>
                    <div class="flex items-center text-gray-500 text-sm">
                        <i class="fas fa-calendar-alt mr-2"></i>
                        ${Utils.formatDateOnly(reward.redeemedAt)}
                    </div>
                </div>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">${reward.title}</h3>
            <p class="text-gray-600 text-sm leading-relaxed mb-4">${reward.description}</p>
            <div class="flex items-center text-success font-semibold mb-4">
                <i class="fas fa-tag mr-2"></i>
                ${reward.value}
            </div>
            <div class="flex justify-between items-center pt-4 border-t border-gray-100">
                <div class="flex items-center text-gray-600">
                    <i class="fas fa-coins mr-2 text-gray-400"></i>
                    <span class="text-sm font-medium">${reward.pointsUsed} points used</span>
                </div>
                <div class="flex items-center text-primary-orange font-semibold">
                    <i class="fas fa-clock mr-2"></i>
                    <span class="text-sm">Required: ${reward.pointsRequired} pts</span>
                </div>
            </div>
        </div>
        `;
    }).join('');

    console.log('Generated HTML length:', html.length);
    console.log('Setting innerHTML...');

    container.innerHTML = html;

    console.log('HTML set successfully. Container now has', container.children.length, 'children');

    // Initialize animations for new elements
    if (typeof Animations !== 'undefined' && Animations.initializeAnimations) {
        Animations.initializeAnimations();
    }
}

// Update claimed rewards count
function updateClaimedRewardsCount() {
    Utils.apiRequest('/api/customers/rewards/claimed')
        .then(data => {
            console.log('Claimed rewards count API response:', data);
            if (data.success && data.data) {
                const countElement = document.getElementById('claimed-count');
                if (countElement) {
                    const count = data.data.totalClaimed || 0;
                    countElement.textContent = count;
                    console.log('Updated claimed count to:', count);
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
window.loadClaimedRewards = loadClaimedRewards;
window.redeemReward = redeemReward;
window.showRewardsTab = showRewardsTab;
window.showRewardCriteria = showRewardCriteria;
