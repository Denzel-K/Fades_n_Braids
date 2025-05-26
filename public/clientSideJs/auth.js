// Authentication and Form Handling for Fades n Braids

// Initialize authentication handlers
function initializeAuth() {
    handleLogoutForms();
    handleAuthForms();
    initializeFormValidation();
}

// Handle logout forms
function handleLogoutForms() {
    const logoutForms = document.querySelectorAll('.logout-form');
    console.log(`Found ${logoutForms.length} logout forms`);
    logoutForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Determine redirect URL based on form action
            let redirectUrl = '/customer/login'; // Default to customer login
            if (this.action.includes('/business/')) {
                redirectUrl = '/business/login';
            }

            console.log(`Logout initiated for: ${this.action}, redirecting to: ${redirectUrl}`);

            // Disable the logout button to prevent multiple clicks
            const logoutButton = this.querySelector('button[type="submit"]');
            if (!logoutButton) {
                console.error('Logout button not found');
                return;
            }

            const originalButtonContent = logoutButton.innerHTML;
            logoutButton.disabled = true;
            logoutButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span class="btn-text">Logging out...</span>';

            fetch(this.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Logged out successfully', 'success', 1000);
                    logoutButton.innerHTML = '<i class="fas fa-check"></i> <span class="btn-text">Success!</span>';

                    // Use server-provided redirect URL if available, otherwise use fallback
                    const finalRedirectUrl = data.redirectUrl || redirectUrl;

                    // Redirect immediately
                    setTimeout(() => {
                        window.location.href = finalRedirectUrl;
                    }, 300);
                } else {
                    showNotification('Logout failed', 'error');
                    // Restore button state on failure
                    logoutButton.disabled = false;
                    logoutButton.innerHTML = originalButtonContent;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Network error during logout', 'error');

                // Even on error, redirect to login page after a delay
                logoutButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span class="btn-text">Error</span>';
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 2000);
            });
        });
    });
}

// Handle authentication forms
function handleAuthForms() {
    const authForms = document.querySelectorAll('form[data-validate]');
    console.log(`Found ${authForms.length} auth forms with data-validate`);
    authForms.forEach(form => {
        form.addEventListener('submit', handleAuthFormSubmit);

        // Add real-time validation
        const inputs = form.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', clearValidationErrors);
        });
    });
}

// Authentication form submission handler
function handleAuthFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    // Clear any existing error states
    form.querySelectorAll('.form-input.error').forEach(input => {
        input.classList.remove('error');
    });

    // Add loading state to form
    form.classList.add('loading');

    // Disable submit button and show loading
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    // Convert FormData to JSON
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Submit form
    fetch(form.action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        // Remove loading state
        form.classList.remove('loading');

        if (result.success) {
            // Add success state
            form.classList.add('success');

            // Add success state to all inputs
            form.querySelectorAll('.form-input').forEach(input => {
                input.classList.add('success');
            });

            // Update button to show success
            submitButton.innerHTML = '<i class="fas fa-check"></i> Success! Redirecting...';

            // Determine redirect URL based on form action or server response
            let redirectUrl = result.redirectUrl || '/customer/dashboard';
            if (form.action.includes('/business/')) {
                redirectUrl = result.redirectUrl || '/business/dashboard';
            }

            // Show brief success message and redirect immediately
            showNotification(result.message, 'success', 1000);

            // Redirect immediately without delay
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 500);
        } else {
            // Show error message
            showNotification(result.message || 'Authentication failed', 'error');

            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;

            // Highlight form errors if any
            if (result.errors) {
                result.errors.forEach(error => {
                    const field = form.querySelector(`[name="${error.param}"]`);
                    if (field) {
                        field.classList.add('error');
                        field.addEventListener('input', () => {
                            field.classList.remove('error');
                        }, { once: true });
                    }
                });
            } else {
                // If no specific field errors, highlight all required fields
                form.querySelectorAll('input[required]').forEach(input => {
                    input.classList.add('error');
                    input.addEventListener('input', () => {
                        input.classList.remove('error');
                    }, { once: true });
                });
            }
        }
    })
    .catch(error => {
        console.error('Authentication error:', error);

        // Remove loading state
        form.classList.remove('loading');

        showNotification('Network error. Please try again.', 'error');

        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;

        // Highlight all inputs as error for network issues
        form.querySelectorAll('.form-input').forEach(input => {
            input.classList.add('error');
            input.addEventListener('input', () => {
                input.classList.remove('error');
            }, { once: true });
        });
    });
}

// Form validation functions
function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();

    // Clear previous states
    input.classList.remove('error', 'success');

    // Skip validation if empty (unless required)
    if (!value && !input.required) return;

    let isValid = true;

    // Required field validation
    if (input.required && !value) {
        isValid = false;
    }

    // Type-specific validation
    switch (input.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                isValid = false;
            }
            break;

        case 'tel':
            // Basic phone validation (at least 10 digits)
            const phoneRegex = /\d{10,}/;
            if (value && !phoneRegex.test(value.replace(/\D/g, ''))) {
                isValid = false;
            }
            break;

        case 'password':
            if (value && value.length < 6) {
                isValid = false;
            }
            break;
    }

    // Apply validation state
    if (value) {
        input.classList.add(isValid ? 'success' : 'error');
    }
}

function clearValidationErrors(e) {
    const input = e.target;
    input.classList.remove('error');
}

// Initialize form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const inputs = form.querySelectorAll('input[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });

            if (!isValid) {
                e.preventDefault();
                showNotification('Please fill in all required fields', 'warning');
            }
        });
    });
}

// Password strength checker
function checkPasswordStrength(password) {
    const strength = {
        score: 0,
        feedback: []
    };

    if (password.length >= 8) strength.score++;
    else strength.feedback.push('At least 8 characters');

    if (/[a-z]/.test(password)) strength.score++;
    else strength.feedback.push('Lowercase letter');

    if (/[A-Z]/.test(password)) strength.score++;
    else strength.feedback.push('Uppercase letter');

    if (/\d/.test(password)) strength.score++;
    else strength.feedback.push('Number');

    if (/[^a-zA-Z\d]/.test(password)) strength.score++;
    else strength.feedback.push('Special character');

    return strength;
}

// Show password strength indicator
function showPasswordStrength(inputElement, strengthElement) {
    inputElement.addEventListener('input', function() {
        const password = this.value;
        const strength = checkPasswordStrength(password);

        const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const strengthColors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'];

        strengthElement.textContent = strengthLevels[strength.score] || 'Very Weak';
        strengthElement.style.color = strengthColors[strength.score] || strengthColors[0];

        if (strength.feedback.length > 0) {
            strengthElement.title = 'Missing: ' + strength.feedback.join(', ');
        }
    });
}

// Export auth functions
window.Auth = {
    initializeAuth,
    validateInput,
    checkPasswordStrength,
    showPasswordStrength
};

// Make functions globally available
window.validateInput = validateInput;
window.clearValidationErrors = clearValidationErrors;
