/**
 * Main JavaScript for Prompt Engineering Taxonomy
 * Handles general UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all interactive elements
    initializeScrollEffects();
    initializeHeaderScroll();
    initializeExternalLinks();
});

/**
 * Add smooth scroll for anchor links
 */
function initializeScrollEffects() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Account for header
                behavior: 'smooth'
            });
        });
    });
}

/**
 * Handle header styles on scroll
 */
function initializeHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/**
 * Add target="_blank" to external links
 */
function initializeExternalLinks() {
    const currentHost = window.location.host;
    
    document.querySelectorAll('a').forEach(link => {
        if (link.href && link.host !== currentHost && !link.target) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
    });
}

/**
 * Set active navigation link based on current page
 */
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        // Get the path from the href
        const linkPath = new URL(link.href, window.location.origin).pathname;
        
        // Check if the current path includes the link path
        // or if we're at root and the link is to index.html
        if (currentPath.includes(linkPath) && linkPath !== '/' || 
            (currentPath === '/' && linkPath.includes('index.html'))) {
            link.classList.add('active');
        }
    });
}

// Call setActiveNavLink when DOM is loaded
document.addEventListener('DOMContentLoaded', setActiveNavLink);