// Animation and UI Effects for Fades n Braids

// Initialize all animations
function initializeAnimations() {
    initializeScrollAnimations();
    initializePageAnimations();
    initializeCounterAnimations();
    initializeRippleEffects();
}

// Intersection Observer for scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationType = element.dataset.animate;
                const delay = element.dataset.delay || 0;

                setTimeout(() => {
                    switch (animationType) {
                        case 'slide-up':
                            element.classList.add('fade-in-up');
                            break;
                        case 'fade-in':
                            element.classList.add('fade-in-up');
                            break;
                        case 'counter':
                            animateCounter(element);
                            break;
                        case 'slide-left':
                            element.classList.add('slide-in-left');
                            break;
                        case 'slide-right':
                            element.classList.add('slide-in-right');
                            break;
                        default:
                            element.classList.add('fade-in-up');
                    }
                }, delay);

                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Observe all elements with animation attributes
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });
}

// Initialize page-specific animations
function initializePageAnimations() {
    // Add stagger animation to lists
    const lists = document.querySelectorAll('.benefits-grid > *, .steps > *, .quick-actions-grid > *');
    lists.forEach((item, index) => {
        item.classList.add('stagger-item');
        item.style.animationDelay = `${index * 0.1}s`;
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.dashboard-card, .stat-card, .benefit-card');
    cards.forEach(card => {
        card.classList.add('hover-lift');
    });

    // Add shimmer effect to loading elements
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => {
        el.classList.add('shimmer');
    });
}

// Counter animation
function animateCounter(element) {
    const target = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Initialize counter animations for visible elements
function initializeCounterAnimations() {
    const counters = document.querySelectorAll('[data-animate="counter"]');
    counters.forEach(counter => {
        if (Utils.isInViewport(counter)) {
            animateCounter(counter);
        }
    });
}

// Ripple effects for buttons
function initializeRippleEffects() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
            const button = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
            Utils.addRippleEffect(button, e);
        }
    });
}

// Modal animations
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.classList.add('scale-in');
        }
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.classList.add('scale-out');
        }
        setTimeout(() => {
            modal.classList.remove('show');
            if (content) {
                content.classList.remove('scale-in', 'scale-out');
            }
            document.body.style.overflow = '';
        }, 300);
    }
}

// Tab animations
function switchTab(tabName, containerSelector = '.tab-container') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Update tab buttons
    container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeTab = container.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Update tab content with animation
    container.querySelectorAll('.tab-content').forEach(content => {
        if (content.classList.contains('active')) {
            content.classList.add('fade-out');
            setTimeout(() => {
                content.classList.remove('active', 'fade-out');
            }, 150);
        }
    });

    setTimeout(() => {
        const targetContent = container.querySelector(`#${tabName}-tab`);
        if (targetContent) {
            targetContent.classList.add('active', 'fade-in');
            setTimeout(() => {
                targetContent.classList.remove('fade-in');
            }, 300);
        }
    }, 150);
}

// Loading state animations
function showLoadingState(element, message = 'Loading...') {
    const originalContent = element.innerHTML;
    element.dataset.originalContent = originalContent;
    
    element.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>${message}</span>
        </div>
    `;
    element.classList.add('loading');
}

function hideLoadingState(element) {
    const originalContent = element.dataset.originalContent;
    if (originalContent) {
        element.innerHTML = originalContent;
        delete element.dataset.originalContent;
    }
    element.classList.remove('loading');
}

// Smooth scroll with animation
function smoothScrollTo(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        // Add highlight animation
        element.classList.add('highlight-section');
        setTimeout(() => {
            element.classList.remove('highlight-section');
        }, 2000);
    }
}

// Parallax effect for hero sections
function initializeParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('scroll', Utils.throttle(() => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const rate = scrolled * -0.5;
            element.style.transform = `translateY(${rate}px)`;
        });
    }, 10));
}

// Typewriter effect
function typewriterEffect(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;
    
    const timer = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
        }
    }, speed);
}

// Add CSS animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    @keyframes scaleOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.9);
        }
    }

    @keyframes highlight {
        0% { background-color: rgba(238, 117, 42, 0.1); }
        100% { background-color: transparent; }
    }

    .fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
    }

    .slide-in-left {
        animation: slideInLeft 0.6s ease-out forwards;
    }

    .slide-in-right {
        animation: slideInRight 0.6s ease-out forwards;
    }

    .scale-in {
        animation: scaleIn 0.3s ease-out forwards;
    }

    .scale-out {
        animation: scaleOut 0.3s ease-out forwards;
    }

    .highlight-section {
        animation: highlight 2s ease-out;
    }

    .fade-in {
        animation: fadeInUp 0.3s ease-out forwards;
    }

    .fade-out {
        animation: fadeInUp 0.15s ease-out reverse forwards;
    }

    .stagger-item {
        opacity: 0;
        animation: fadeInUp 0.6s ease-out forwards;
    }

    .hover-lift {
        transition: transform 0.3s ease;
    }

    .hover-lift:hover {
        transform: translateY(-2px);
    }

    .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem;
    }
`;
document.head.appendChild(animationStyles);

// Export animation functions
window.Animations = {
    initializeAnimations,
    animateCounter,
    showModal,
    hideModal,
    switchTab,
    showLoadingState,
    hideLoadingState,
    smoothScrollTo,
    typewriterEffect
};

// Make key functions globally available
window.showModal = showModal;
window.hideModal = hideModal;
window.switchTab = switchTab;
