// Global Image Caching System
// This file provides image preloading and caching functionality across all pages

class GlobalImageCache {
    constructor() {
        this.imageCache = new Map();
        this.preloadedImages = new Set();
        this.cacheKey = 'pharmaDirectImageCache';
        this.maxCacheSize = 100; // Maximum number of images to cache
        this.init();
    }

    init() {
        // Load cached images from localStorage on initialization
        this.loadFromStorage();
        
        // Save to localStorage periodically
        setInterval(() => {
            this.saveToStorage();
        }, 30000); // Save every 30 seconds
        
        // Save to localStorage when page is about to unload
        window.addEventListener('beforeunload', () => {
            this.saveToStorage();
        });
    }

    // Preload an image and add to cache
    async preloadImage(src) {
        if (this.preloadedImages.has(src)) {
            console.log('📦 Image already cached:', src);
            return Promise.resolve(this.imageCache.get(src));
        }
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Enable CORS for caching
            
            img.onload = () => {
                // Add to cache
                this.preloadedImages.add(src);
                this.imageCache.set(src, {
                    src: img.src,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    loadedAt: Date.now()
                });
                
                console.log('📦 Image preloaded and cached:', src);
                resolve(img);
            };
            
            img.onerror = () => {
                console.warn('❌ Failed to preload image:', src);
                reject(new Error(`Failed to load image: ${src}`));
            };
            
            img.src = src;
        });
    }

    // Get cached image or preload if not cached
    async getCachedImage(src) {
        if (this.preloadedImages.has(src)) {
            console.log('⚡ Using cached image:', src);
            const cached = this.imageCache.get(src);
            if (cached) {
                // Create a new image element with cached data
                const img = new Image();
                img.src = cached.src;
                return img;
            }
        }
        
        console.log('🔄 Preloading image:', src);
        try {
            return await this.preloadImage(src);
        } catch (error) {
            console.warn('⚠️ Failed to preload, using fallback');
            return null;
        }
    }

    // Check if image is cached
    isCached(src) {
        return this.preloadedImages.has(src);
    }

    // Get all cached image URLs
    getCachedUrls() {
        return Array.from(this.preloadedImages);
    }

    // Preload multiple images
    async preloadImages(urls) {
        const promises = urls.map(url => 
            this.preloadImage(url).catch(() => {
                console.warn('Failed to preload:', url);
                return null;
            })
        );
        
        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value !== null);
        
        console.log(`📦 Preloaded ${successful.length}/${urls.length} images`);
        return successful.map(r => r.value);
    }

    // Save cache to localStorage
    saveToStorage() {
        try {
            const cacheData = {
                images: Array.from(this.imageCache.entries()),
                urls: Array.from(this.preloadedImages),
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
            console.log('💾 Image cache saved to localStorage');
        } catch (error) {
            console.warn('⚠️ Failed to save image cache:', error);
        }
    }

    // Load cache from localStorage
    loadFromStorage() {
        try {
            const cacheData = localStorage.getItem(this.cacheKey);
            if (cacheData) {
                const parsed = JSON.parse(cacheData);
                
                // Check if cache is not too old (24 hours)
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                if (Date.now() - parsed.timestamp < maxAge) {
                    this.imageCache = new Map(parsed.images);
                    this.preloadedImages = new Set(parsed.urls);
                    console.log('📦 Image cache loaded from localStorage:', this.preloadedImages.size, 'images');
                } else {
                    console.log('🗑️ Image cache expired, clearing');
                    this.clearCache();
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to load image cache:', error);
            this.clearCache();
        }
    }

    // Clear cache
    clearCache() {
        this.imageCache.clear();
        this.preloadedImages.clear();
        localStorage.removeItem(this.cacheKey);
        console.log('🗑️ Image cache cleared');
    }

    // Get cache statistics
    getStats() {
        return {
            cachedImages: this.preloadedImages.size,
            cacheSize: this.imageCache.size,
            urls: Array.from(this.preloadedImages)
        };
    }

    // Preload images from product data
    async preloadProductImages(products) {
        const imageUrls = products.map(product => 
            product.imageURL || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop'
        );
        
        return await this.preloadImages(imageUrls);
    }

    // Setup image loading with caching for a specific element
    async setupImageLoading(imgElement, placeholderElement) {
        if (!imgElement || !placeholderElement) {
            console.log('❌ Image or placeholder element not found');
            return;
        }

        const src = imgElement.src;
        console.log('🖼️ Setting up image loading for:', src);

        // Function to show the image
        const showImage = () => {
            console.log('🎯 Showing image:', src);
            imgElement.style.opacity = '1';
            imgElement.parentElement?.classList.remove('bg-gray-100');
            placeholderElement.style.display = 'none';
        };

        // Function to show error
        const showError = () => {
            console.log('❌ Showing image error for:', src);
            imgElement.style.display = 'none';
            placeholderElement.innerHTML = '<div class="text-gray-400 text-lg">Image unavailable</div>';
        };

        // Check if image is already cached
        if (this.isCached(src)) {
            console.log('⚡ Image is cached, showing immediately');
            showImage();
            return;
        }

        // Check if image is already loaded
        if (imgElement.complete && imgElement.naturalHeight > 0) {
            console.log('✅ Image already loaded, caching and showing');
            this.preloadedImages.add(src);
            this.imageCache.set(src, {
                src: imgElement.src,
                width: imgElement.naturalWidth,
                height: imgElement.naturalHeight,
                loadedAt: Date.now()
            });
            showImage();
            return;
        }

        // Try to get cached image
        try {
            const cachedImg = await this.getCachedImage(src);
            if (cachedImg) {
                console.log('⚡ Using cached image for display');
                imgElement.src = cachedImg.src;
                showImage();
                return;
            }
        } catch (error) {
            console.log('⚠️ Cached image not available, proceeding with normal loading');
        }

        // Set up event listeners
        imgElement.onload = () => {
            console.log('🎉 Image loaded:', src);
            this.preloadedImages.add(src);
            this.imageCache.set(src, {
                src: imgElement.src,
                width: imgElement.naturalWidth,
                height: imgElement.naturalHeight,
                loadedAt: Date.now()
            });
            showImage();
        };

        imgElement.onerror = () => {
            console.log('💥 Image failed to load:', src);
            showError();
        };

        // Force reload
        const currentSrc = imgElement.src;
        imgElement.src = '';
        imgElement.src = currentSrc;

        // Fallback timeouts
        setTimeout(() => {
            if (imgElement.complete && imgElement.naturalHeight > 0 && imgElement.style.opacity === '0') {
                console.log('🔧 Fallback: Image loaded but not shown');
                this.preloadedImages.add(src);
                this.imageCache.set(src, {
                    src: imgElement.src,
                    width: imgElement.naturalWidth,
                    height: imgElement.naturalHeight,
                    loadedAt: Date.now()
                });
                showImage();
            }
        }, 200);

        setTimeout(() => {
            if (imgElement.complete && imgElement.naturalHeight > 0 && imgElement.style.opacity === '0') {
                console.log('🔧 Fallback 2: Image loaded but not shown');
                showImage();
            }
        }, 500);

        setTimeout(() => {
            if (imgElement.style.opacity === '0') {
                console.log('💥 Image loading timeout');
                showError();
            }
        }, 3000);
    }
}

// Create global instance
window.globalImageCache = new GlobalImageCache();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalImageCache;
}
