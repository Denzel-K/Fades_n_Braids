// Mobile Navigation Management for Fades n Braids

class MobileNavigation {
    constructor() {
        this.toggle = null;
        this.menu = null;
        this.backdrop = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupNavigation());
        } else {
            this.setupNavigation();
        }
    }

    setupNavigation() {
        this.toggle = document.getElementById('navbar-toggle');
        this.menu = document.getElementById('mobile-menu');

        if (!this.toggle || !this.menu) {
            console.warn('Mobile navigation elements not found');
            return;
        }

        // Create backdrop element (disabled to fix click issues)
        // this.createBackdrop();

        // Bind events
        this.bindEvents();

        console.log('Mobile navigation initialized');
    }

    createBackdrop() {
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'mobile-menu-backdrop hidden';
        this.backdrop.id = 'mobile-menu-backdrop';
        document.body.appendChild(this.backdrop);
    }

    bindEvents() {
        // Toggle button click
        this.toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMenu();
        });

        // Backdrop click to close (disabled)
        // this.backdrop.addEventListener('click', () => {
        //     this.closeMenu();
        // });

        // Close menu when clicking on navigation links
        const navLinks = this.menu.querySelectorAll('.mobile-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Close menu after a short delay for all links
                setTimeout(() => this.closeMenu(), 200);
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen &&
                !this.menu.contains(e.target) &&
                !this.toggle.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Close menu on window resize to desktop size
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && this.isOpen) {
                this.closeMenu();
            }
        });

        // Prevent body scroll when menu is open
        this.menu.addEventListener('transitionstart', () => {
            if (this.isOpen) {
                document.body.style.overflow = 'hidden';
            }
        });

        this.menu.addEventListener('transitionend', () => {
            if (!this.isOpen) {
                document.body.style.overflow = '';
            }
        });
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        if (this.isOpen) return;

        this.isOpen = true;

        // Update toggle button
        this.toggle.classList.add('active');
        this.toggle.setAttribute('aria-expanded', 'true');

        // Show backdrop (disabled)
        // this.backdrop.classList.remove('hidden');
        // // Force reflow before adding show class
        // this.backdrop.offsetHeight;
        // this.backdrop.classList.add('show');

        // Show menu
        this.menu.classList.remove('hidden');
        // Force reflow before adding show class
        this.menu.offsetHeight;
        this.menu.classList.add('show');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus management
        this.trapFocus();

        console.log('Mobile menu opened');
    }

    closeMenu() {
        if (!this.isOpen) return;

        this.isOpen = false;

        // Update toggle button
        this.toggle.classList.remove('active');
        this.toggle.setAttribute('aria-expanded', 'false');

        // Hide backdrop (disabled)
        // this.backdrop.classList.remove('show');
        // setTimeout(() => {
        //     this.backdrop.classList.add('hidden');
        // }, 300);

        // Hide menu
        this.menu.classList.remove('show');
        setTimeout(() => {
            this.menu.classList.add('hidden');
        }, 300);

        // Restore body scroll
        document.body.style.overflow = '';

        // Return focus to toggle button
        this.toggle.focus();

        console.log('Mobile menu closed');
    }

    trapFocus() {
        const focusableElements = this.menu.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus first element
        firstElement.focus();

        // Handle tab navigation
        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        // Add event listener
        document.addEventListener('keydown', handleTabKey);

        // Remove event listener when menu closes
        const removeTabHandler = () => {
            document.removeEventListener('keydown', handleTabKey);
            document.removeEventListener('keydown', removeTabHandler);
        };

        // Clean up when menu closes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'class' &&
                    this.menu.classList.contains('hidden')) {
                    removeTabHandler();
                    observer.disconnect();
                }
            });
        });

        observer.observe(this.menu, { attributes: true });
    }


}

// Initialize mobile navigation
const mobileNav = new MobileNavigation();

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileNavigation;
}
