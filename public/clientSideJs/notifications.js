// Notification System for Fades n Braids

// Enhanced notification system
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    // Add icon based on type using FontAwesome
    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };

    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.click()">
            <i class="fas fa-times"></i>
        </button>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        color: white;
        font-weight: 500;
        z-index: 9999;
        max-width: 350px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;

    const colors = {
        success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    };
    notification.style.background = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.classList.add('show');
    }, 100);

    // Auto remove after specified duration
    const autoRemoveTimeout = setTimeout(() => {
        removeNotification(notification);
    }, duration);

    // Click to dismiss
    notification.addEventListener('click', () => {
        clearTimeout(autoRemoveTimeout);
        removeNotification(notification);
    });

    return notification;
}

// Remove notification with animation
function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 400);
}

// Show loading notification
function showLoadingNotification(message = 'Loading...') {
    const notification = document.createElement('div');
    notification.className = 'notification notification-loading';
    notification.id = 'loading-notification';

    notification.innerHTML = `
        <span class="notification-icon">
            <i class="fas fa-spinner fa-spin"></i>
        </span>
        <span class="notification-message">${message}</span>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        color: white;
        font-weight: 500;
        z-index: 9999;
        max-width: 350px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    return notification;
}

// Hide loading notification
function hideLoadingNotification() {
    const notification = document.getElementById('loading-notification');
    if (notification) {
        removeNotification(notification);
    }
}

// Show confirmation dialog
function showConfirmation(message, onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'modal confirmation-modal';
    modal.innerHTML = `
        <div class="modal-content confirmation-content">
            <div class="modal-header">
                <h3><i class="fas fa-question-circle"></i> Confirmation</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline cancel-btn">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="btn btn-primary confirm-btn">
                    <i class="fas fa-check"></i> Confirm
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.classList.add('show');

    const confirmBtn = modal.querySelector('.confirm-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');

    confirmBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        if (onConfirm) onConfirm();
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        if (onCancel) onCancel();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
            if (onCancel) onCancel();
        }
    });
}

// Toast notification for quick messages
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '<i class="fas fa-check"></i>',
        error: '<i class="fas fa-times"></i>',
        warning: '<i class="fas fa-exclamation"></i>',
        info: '<i class="fas fa-info"></i>'
    };

    toast.innerHTML = `
        ${icons[type] || icons.info}
        <span>${message}</span>
    `;

    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100%);
        padding: 0.75rem 1.5rem;
        border-radius: 2rem;
        color: white;
        font-weight: 500;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: transform 0.3s ease;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    `;

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100%)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Export notification functions
window.Notifications = {
    showNotification,
    showLoadingNotification,
    hideLoadingNotification,
    showConfirmation,
    showToast
};

// Make functions globally available for backward compatibility
window.showNotification = showNotification;
window.showConfirmation = showConfirmation;
window.showToast = showToast;
