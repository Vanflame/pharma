// Firebase initialization and exports
// Using Firebase v12 modular SDK via ESM imports in HTML pages

export const firebaseConfig = {
    apiKey: "AIzaSyDx1tnxUzUVcJEunO_uAsggeVYG7hD-83U",
    authDomain: "im2-pharma-direct.firebaseapp.com",
    projectId: "im2-pharma-direct",
    storageBucket: "im2-pharma-direct.firebasestorage.app",
    messagingSenderId: "27484148825",
    appId: "1:27484148825:web:89f7f7e0460b91c215cd48"
};

// Note: the actual Firebase SDK modules will be imported inline in each page's <script type="module">
// to avoid mixed environments. This file centralizes config and shared helpers.

export const COLLECTIONS = {
    users: "users",
    products: "products",
    orders: "orders",
    pharmacies: "pharmacies",
    settings: "settings",
    addresses: "addresses"
};

export const ORDER_STAGES = [
    "Pending",
    "Confirmed",
    "To Be Received",
    "Delivered",
    "Declined",
    "Cancelled"
];

export const PAYMENT_METHODS = ["COD", "Card", "GCash", "PayMaya"];

export function formatCurrency(value) {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
}

// Utility function to safely convert Firestore timestamps to JavaScript Date objects
export function safeDateConversion(timestamp) {
    try {
        if (!timestamp) {
            return new Date();
        }
        
        // Handle Firestore Timestamp objects
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
        }
        
        // Handle Unix timestamps (numbers)
        if (typeof timestamp === 'number') {
            return new Date(timestamp);
        }
        
        // Handle regular Date objects or date strings
        if (timestamp instanceof Date) {
            return timestamp;
        }
        
        // Try to parse as a date string
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            console.warn('Invalid date provided, using current date:', timestamp);
            return new Date();
        }
        
        return date;
    } catch (error) {
        console.error('Error converting timestamp to date:', error, timestamp);
        return new Date();
    }
}

// Utility function to format dates consistently across the app
export function formatDate(timestamp, options = {}) {
    const date = safeDateConversion(timestamp);
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

// Utility function to format relative time (e.g., "2h ago", "3d ago")
export function formatRelativeTime(timestamp) {
    const date = safeDateConversion(timestamp);
    const now = new Date();
    const diffInMinutes = Math.abs(now - date) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;

    if (diffInMinutes < 1) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
        return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Professional error message handler
export function getProfessionalErrorMessage(error) {
    // Handle Firebase Auth errors
    if (error.code) {
        switch (error.code) {
            // Authentication errors
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                return 'Invalid email or password. Please check your credentials and try again.';
            
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            
            case 'auth/user-disabled':
            case 'auth/account-disabled':
                return 'Your account has been disabled by an administrator. Please contact support for assistance.';
            
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please wait a moment before trying again.';
            
            case 'auth/email-already-in-use':
                return 'An account with this email already exists. Please use a different email or try logging in.';
            
            case 'auth/weak-password':
                return 'Password is too weak. Please choose a stronger password with at least 6 characters.';
            
            case 'auth/operation-not-allowed':
                return 'This sign-in method is not enabled. Please contact support.';
            
            // Firestore errors
            case 'permission-denied':
                return 'You do not have permission to perform this action. Please contact support if this persists.';
            
            case 'unavailable':
                return 'Service is temporarily unavailable. Please try again in a few moments.';
            
            case 'unauthenticated':
                return 'Please log in to continue.';
            
            case 'not-found':
                return 'The requested information was not found.';
            
            case 'already-exists':
                return 'This item already exists.';
            
            case 'resource-exhausted':
                return 'Service is temporarily overloaded. Please try again later.';
            
            case 'failed-precondition':
                return 'Unable to complete this action. Please refresh the page and try again.';
            
            case 'aborted':
                return 'Operation was cancelled. Please try again.';
            
            case 'out-of-range':
                return 'The requested operation is out of range.';
            
            case 'unimplemented':
                return 'This feature is not yet available.';
            
            case 'internal':
                return 'An internal error occurred. Please try again or contact support.';
            
            case 'data-loss':
                return 'Data loss occurred. Please refresh and try again.';
            
            default:
                return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
        }
    }
    
    // Handle generic errors
    if (error.message) {
        // If it's already a user-friendly message, return it
        if (!error.message.includes('Firebase:') && !error.message.includes('auth/')) {
            return error.message;
        }
        
        // Otherwise, provide a generic message
        return 'Something went wrong. Please try again.';
    }
    
    // Fallback for unknown errors
    return 'An unexpected error occurred. Please try again.';
}

// Utility function to show professional error messages
export function showError(message, elementId = 'error') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = getProfessionalErrorMessage(message);
        errorElement.classList.remove('hidden');
    } else {
        // Fallback to alert if no error element found
        alert(getProfessionalErrorMessage(message));
    }
}

// Utility function to show success messages
export function showSuccess(message, elementId = 'success') {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('hidden');
    } else {
        // Fallback to alert if no success element found
        alert(message);
    }
}

// Loading indicator utility
export function setButtonLoading(button, isLoading, loadingText = 'Processing...', originalText = null) {
    if (!button) return;
    
    if (isLoading) {
        // Store original text if not provided
        if (!originalText) {
            originalText = button.textContent;
            button.dataset.originalText = originalText;
        }
        
        // Disable button and show loading state
        button.disabled = true;
        button.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ${loadingText}
        `;
        button.classList.add('opacity-75', 'cursor-not-allowed');
    } else {
        // Restore original state
        button.disabled = false;
        button.textContent = originalText || button.dataset.originalText || 'Button';
        button.classList.remove('opacity-75', 'cursor-not-allowed');
    }
}

// Utility function to show loading modal
export function showLoadingModal(title = 'Processing...', message = 'Please wait while we process your request.') {
    // Remove existing loading modal if any
    const existingModal = document.getElementById('loading-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'loading-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-sm w-full text-center">
            <div class="flex justify-center mb-4">
                <svg class="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">${title}</h3>
            <p class="text-sm text-gray-600">${message}</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

// Utility function to hide loading modal
export function hideLoadingModal() {
    const modal = document.getElementById('loading-modal');
    if (modal) {
        modal.remove();
    }
}




