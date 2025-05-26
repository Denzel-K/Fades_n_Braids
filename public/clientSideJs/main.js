// Main JavaScript Coordinator for Fades n Braids
// This file coordinates all the modular JavaScript files

document.addEventListener('DOMContentLoaded', function() {
    console.log('Fades n Braids app loaded');
    console.log('Current page:', window.location.pathname);

    // Initialize core modules
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Initialize animations first
    if (typeof Animations !== 'undefined') {
        Animations.initializeAnimations();
    }

    // Initialize authentication handlers
    if (typeof Auth !== 'undefined') {
        Auth.initializeAuth();
    }

    // Initialize page-specific functionality
    initializePageSpecificFeatures();

    // Initialize global event handlers
    initializeGlobalHandlers();
}

// Initialize page-specific features
function initializePageSpecificFeatures() {
    // Customer dashboard
    if (document.querySelector('.dashboard-page')) {
        if (typeof Dashboard !== 'undefined') {
            Dashboard.initializeDashboard();
        }
    }

    // Business dashboard
    if (document.querySelector('.business-dashboard')) {
        if (typeof BusinessDashboard !== 'undefined') {
            BusinessDashboard.initializeBusinessDashboard();
        }
    }

    // Check-in codes page
    if (document.querySelector('.checkin-codes-page')) {
        initializeCheckInCodes();
    }
}

// Initialize global event handlers
function initializeGlobalHandlers() {
    // Mobile navigation toggle
    initializeMobileNavigation();

    // Modal handlers
    initializeModalHandlers();

    // Ripple effects for buttons
    if (typeof Utils !== 'undefined') {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
                const button = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
                Utils.addRippleEffect(button, e);
            }
        });
    }
}

// Initialize mobile navigation
function initializeMobileNavigation() {
    const navToggle = document.getElementById('navbar-toggle');
    const navMenu = document.getElementById('navbar-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
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
            if (e.target.classList.contains('nav-btn') || e.target.closest('.nav-btn')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Initialize modal handlers
function initializeModalHandlers() {
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
}

// Check-in codes page initialization
function initializeCheckInCodes() {
    console.log('Initializing check-in codes page');
    // Check-in codes specific functionality can be added here
}

// Legacy function support for backward compatibility
function showVisitHistory() {
    if (typeof showNotification !== 'undefined') {
        showNotification('Visit history feature coming soon!', 'info');
    }
}

function showProfile() {
    if (typeof showNotification !== 'undefined') {
        showNotification('Profile editing feature coming soon!', 'info');
    }
}

// Business modal functions - delegate to business-modals.js
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

function showRewardCriteria() {
    if (typeof showNotification !== 'undefined') {
        showNotification('Reward criteria: Check-in = 10 points, Welcome bonus = 50 points', 'info', 8000);
    }
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

// Business dashboard tab functions
function showDashboardTab(tabName) {
    if (typeof BusinessDashboard !== 'undefined' && BusinessDashboard.showDashboardTab) {
        BusinessDashboard.showDashboardTab(tabName);
    } else if (typeof showDashboardTab !== 'undefined') {
        // Call the global function if available
        window.showDashboardTab(tabName);
    } else {
        console.log('Switching to tab:', tabName);
    }
}

// Placeholder functions for business management
function showAddCustomerForm() {
    showNotification('Add customer feature coming soon!', 'info');
}

function exportCustomers() {
    showNotification('Export customers feature coming soon!', 'info');
}

function showAddRewardForm() {
    showNotification('Add reward feature coming soon!', 'info');
}

function showAwardPointsForm() {
    showNotification('Award points feature coming soon!', 'info');
}

function exportAllData() {
    showNotification('Export data feature coming soon!', 'info');
}

function showSettings() {
    showNotification('Settings feature coming soon!', 'info');
}

// Export main functions for global access
window.showVisitHistory = showVisitHistory;
window.showProfile = showProfile;
window.showCustomersModal = showCustomersModal;
window.showRewardsModal = showRewardsModal;
window.showAwardPointsModal = showAwardPointsModal;
window.showAnalytics = showAnalytics;
window.showRewardCriteria = showRewardCriteria;
window.scrollToRewards = scrollToRewards;
window.showDashboardTab = showDashboardTab;
window.showAddCustomerForm = showAddCustomerForm;
window.exportCustomers = exportCustomers;
window.showAddRewardForm = showAddRewardForm;
window.showAwardPointsForm = showAwardPointsForm;
window.exportAllData = exportAllData;
window.showSettings = showSettings;
