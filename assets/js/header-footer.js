/**
 * header-footer.js
 * Injects consistent headers and footers across all pages in the Prompt Engineering Taxonomy project
 */

document.addEventListener('DOMContentLoaded', function() {
    // Determine the current page path and directory level
    const currentPath = window.location.pathname;
    const isRoot = !currentPath.includes('/') || currentPath.endsWith('/index.html') || currentPath.endsWith('/');
    const isInReports = currentPath.includes('/reports/');
    const isInPromptTaxonomy = currentPath.includes('/PromptEngineeringTaxonomy/');
    
    // Set the base path prefix based on directory level
    let basePath = '';
    if (isInReports) {
        basePath = '../';
    } else if (isInPromptTaxonomy) {
        basePath = '../';
    }
    
    // Force remove any existing header content to ensure consistency
    const existingHeader = document.querySelector('header');
    if (existingHeader) {
        // Clear existing header content before injection
        existingHeader.innerHTML = '';
    }
    
    // Inject the standardized header
    injectHeader(basePath);
    
    // Inject the standardized footer
    injectFooter(basePath);
    
    // Set the active navigation link based on current page
    setActiveNavLink();
});

/**
 * Injects a standardized header into the page
 * @param {string} basePath - The relative path prefix to use for links
 */
/**
 * Injects a standardized header into the page
 * @param {string} basePath - The relative path prefix to use for links
 */
function injectHeader(basePath) {
    // Get the existing header element
    const existingHeader = document.querySelector('header');
    if (!existingHeader) return;
    
    // Create the standardized header HTML
    const headerHTML = `
        <div class="header-container">
            <div class="logo">
                <h1>Prompt Engineering Taxonomy</h1>
            </div>
            <nav>
                <a href="${basePath}index.html" class="nav-home">Dashboard</a>
                <a href="${basePath}reports/taxonomy-overview.html" class="nav-taxonomy">Taxonomy</a>
                <a href="${basePath}reports/technique-relationships.html" class="nav-relationships">Relationships</a>
                <a href="${basePath}prompt-builder.html" class="nav-builder">Prompt Builder</a>
                <a href="${basePath}sources.html" class="nav-sources">Sources</a>
                <a href="https://github.com/Mnehmos?tab=repositories" target="_blank" class="nav-github">GitHub</a>
            </nav>
        </div>
    `;
    
    // Replace the existing header content
    existingHeader.innerHTML = headerHTML;
}

/**
 * Injects a standardized footer into the page
 * @param {string} basePath - The relative path prefix to use for links
 */
function injectFooter(basePath) {
    // Get the existing footer element
    const existingFooter = document.querySelector('footer');
    if (!existingFooter) return;
    
    // Create the standardized footer HTML
    const footerHTML = `
        <div class="footer-container">
            <div class="footer-column">
                <h3>Prompt Engineering Taxonomy</h3>
                <p>A comprehensive collection of prompt engineering techniques organized by category and relationship.</p>
            </div>
            <div class="footer-column">
                <h3>Quick Links</h3>
                <ul>
                    <li><a href="${basePath}index.html">Home</a></li>
                    <li><a href="${basePath}reports/taxonomy-overview.html">Taxonomy</a></li>
                    <li><a href="${basePath}reports/technique-relationships.html">Relationships</a></li>
                    <li><a href="${basePath}prompt-builder.html">Prompt Builder</a></li>
                    <li><a href="${basePath}sources.html">Sources</a></li>
                </ul>
            </div>
            <div class="footer-column">
                <h3>Resources</h3>
                <ul>
                    <li><a href="https://github.com/Mnehmos?tab=repositories" target="_blank">GitHub Repository</a></li>
                    <li><a href="https://www.reddit.com/r/ChatGPTPro/comments/1k4iykr/i_distilled_17_research_papers_into_a_taxonomy_of/" target="_blank">Original Reddit Post</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 Prompt Engineering Taxonomy Project. Content based on research compilation by Background-Zombie869.</p>
        </div>
    `;
    
    // Replace the existing footer content
    existingFooter.innerHTML = footerHTML;
}

/**
 * Sets the active class on the appropriate navigation link based on the current page
 */
/**
 * Sets the active class on the appropriate navigation link based on the current page
 */
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    
    // Remove active class from all nav links
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Set active class based on current page
    if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
        document.querySelector('.nav-home')?.classList.add('active');
    } else if (currentPath.includes('taxonomy-overview.html')) {
        document.querySelector('.nav-taxonomy')?.classList.add('active');
    } else if (currentPath.includes('technique-relationships.html')) {
        document.querySelector('.nav-relationships')?.classList.add('active');
    } else if (currentPath.includes('prompt-builder.html')) {
        document.querySelector('.nav-builder')?.classList.add('active');
    } else if (currentPath.includes('sources.html')) {
        document.querySelector('.nav-sources')?.classList.add('active');
    }
}