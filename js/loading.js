// Global Loading System
class LoadingManager {
    constructor() {
        this.loadingOverlay = null;
        this.loadingCount = 0;
        this.init();
    }

    init() {
        // Create global loading overlay
        this.createLoadingOverlay();
        
        // Add CSS for loading animations
        this.addLoadingStyles();
    }

    createLoadingOverlay() {
        // Remove existing overlay if any
        const existing = document.getElementById('global-loading-overlay');
        if (existing) {
            existing.remove();
        }

        // Create loading overlay
        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.id = 'global-loading-overlay';
        this.loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
                <div class="loading-text">Loading...</div>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(this.loadingOverlay);
    }

    addLoadingStyles() {
        // Check if styles already added
        if (document.getElementById('loading-styles')) return;

        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            #global-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(4px);
                z-index: 9999;
                display: none;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }

            .loading-content {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
            }

            .loading-spinner {
                margin-bottom: 1rem;
            }

            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f4f6;
                border-top: 4px solid #10b981;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }

            .loading-text {
                color: #374151;
                font-size: 1rem;
                font-weight: 500;
                margin-top: 0.5rem;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Page transition loading */
            .page-loading {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(2px);
                z-index: 9998;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .page-loading .loading-content {
                background: transparent;
                box-shadow: none;
                border: none;
            }

            .page-loading .spinner {
                width: 32px;
                height: 32px;
                border-width: 3px;
            }

            .page-loading .loading-text {
                font-size: 0.875rem;
                color: #6b7280;
            }

            /* Button loading state */
            .btn-loading {
                position: relative;
                pointer-events: none;
                opacity: 0.7;
            }

            .btn-loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 16px;
                height: 16px;
                margin: -8px 0 0 -8px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            /* Card loading state */
            .card-loading {
                position: relative;
                overflow: hidden;
            }

            .card-loading::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                animation: shimmer 1.5s infinite;
            }

            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }

            /* Skeleton loading */
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
            }

            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            .skeleton-text {
                height: 1rem;
                border-radius: 4px;
                margin-bottom: 0.5rem;
            }

            .skeleton-title {
                height: 1.5rem;
                border-radius: 4px;
                margin-bottom: 1rem;
            }

            .skeleton-image {
                height: 200px;
                border-radius: 8px;
                margin-bottom: 1rem;
            }
        `;
        
        document.head.appendChild(style);
    }

    show(message = 'Loading...') {
        this.loadingCount++;
        
        if (this.loadingOverlay) {
            const loadingText = this.loadingOverlay.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = message;
            }
            this.loadingOverlay.style.display = 'flex';
        }
    }

    hide() {
        this.loadingCount = Math.max(0, this.loadingCount - 1);
        
        if (this.loadingCount === 0 && this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }

    showPageTransition(message = 'Loading page...') {
        // Remove existing page loading
        const existing = document.getElementById('page-loading');
        if (existing) {
            existing.remove();
        }

        // Create page loading overlay
        const pageLoading = document.createElement('div');
        pageLoading.id = 'page-loading';
        pageLoading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        
        document.body.appendChild(pageLoading);
    }

    hidePageTransition() {
        const pageLoading = document.getElementById('page-loading');
        if (pageLoading) {
            pageLoading.remove();
        }
    }

    showButtonLoading(button, text = 'Loading...') {
        if (!button) return;
        
        const originalText = button.textContent;
        button.setAttribute('data-original-text', originalText);
        button.textContent = text;
        button.classList.add('btn-loading');
        button.disabled = true;
    }

    hideButtonLoading(button) {
        if (!button) return;
        
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.textContent = originalText;
            button.removeAttribute('data-original-text');
        }
        button.classList.remove('btn-loading');
        button.disabled = false;
    }

    showCardLoading(card) {
        if (!card) return;
        card.classList.add('card-loading');
    }

    hideCardLoading(card) {
        if (!card) return;
        card.classList.remove('card-loading');
    }

    createSkeletonCard() {
        return `
            <div class="card-loading bg-white rounded-lg border p-4">
                <div class="skeleton skeleton-image mb-4"></div>
                <div class="skeleton skeleton-title mb-2"></div>
                <div class="skeleton skeleton-text mb-2"></div>
                <div class="skeleton skeleton-text mb-4"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        `;
    }

    createSkeletonProduct() {
        return `
            <div class="card-loading bg-white rounded-lg border p-4">
                <div class="skeleton skeleton-image mb-4"></div>
                <div class="skeleton skeleton-title mb-2"></div>
                <div class="skeleton skeleton-text mb-2"></div>
                <div class="skeleton skeleton-text mb-4"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        `;
    }
}

// Create global instance
window.loadingManager = new LoadingManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}
