// Clean Authentication Manager - Simple and Reliable
import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { firebaseConfig, COLLECTIONS } from "./firebase.js";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.redirected = false; // Prevent multiple redirects
        this.initialized = false; // Prevent multiple initializations
        this.lastRedirectTime = 0; // Track last redirect time
        this.setupAuthListener();
        this.checkExistingAuth();
    }

    async checkExistingAuth() {
        // Check if user is already authenticated when page loads
        const currentUser = auth.currentUser;
        const cachedRole = localStorage.getItem('role');
        
        console.log('🔐 Checking existing auth - User:', currentUser?.email || 'None', 'Cached role:', cachedRole);
        
        if (currentUser && cachedRole) {
            console.log('🔐 User already authenticated, checking if account is disabled');
            this.currentUser = currentUser;
            this.currentRole = cachedRole;
            
            // Check if account is disabled
            try {
                const userDoc = await getDoc(doc(db, COLLECTIONS.users, currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    
                    if (userData.disabled === true) {
                        console.log('🚫 Account is disabled during existing auth check, redirecting to disabled page');
                        await signOut(auth);
                        localStorage.removeItem('uid');
                        localStorage.removeItem('role');
                        this.currentUser = null;
                        this.currentRole = null;
                        // Redirect to disabled page
                        window.location.href = '../disabled/';
                        return;
                    }
                    
                    // Update role from Firestore if different from cached
                    if (userData.role !== cachedRole) {
                        console.log('🔐 Role changed in Firestore, updating from', cachedRole, 'to', userData.role);
                        this.currentRole = userData.role;
                        localStorage.setItem('role', userData.role);
                    }
                } else {
                    console.warn('⚠️ User document not found during existing auth check');
                }
            } catch (error) {
                console.error('❌ Error checking user status during existing auth check:', error);
            }
            
            // Check if we're on a page that should redirect
            if (this.shouldRedirect()) {
                console.log('🔐 Already authenticated user on redirect page, redirecting now');
                this.performRedirect(this.currentRole);
            } else {
                console.log('🔐 User already authenticated and on appropriate page, staying here');
            }
            
            // Mark as initialized
            this.initialized = true;
        }
    }

    setupAuthListener() {
        onAuthStateChanged(auth, async (user) => {
            console.log('🔐 Auth state changed - User:', user?.email || 'No user', 'UID:', user?.uid || 'No UID');
            
            this.currentUser = user;
            
            if (user) {
                // Check if we already have the role in localStorage
                const cachedRole = localStorage.getItem('role');
                console.log('🔐 Cached role from localStorage:', cachedRole);
                
                // Get user role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, COLLECTIONS.users, user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        
                        // Check if account is disabled
                        if (userData.disabled === true) {
                            console.log('🚫 Account is disabled, redirecting to disabled page');
                            await signOut(auth);
                            localStorage.removeItem('uid');
                            localStorage.removeItem('role');
                            this.currentUser = null;
                            this.currentRole = null;
                            // Redirect to disabled page
                            window.location.href = '../disabled/';
                            return;
                        }
                        
                        this.currentRole = userData.role || 'user';
                        console.log('🔐 User role from Firestore:', this.currentRole);
                        
                        // Store in localStorage
                        localStorage.setItem('uid', user.uid);
                        localStorage.setItem('role', this.currentRole);
                        
                        // Redirect based on role
                        if (this.shouldRedirect()) {
                            console.log('🔐 About to redirect with role:', this.currentRole);
                            this.performRedirect(this.currentRole);
                        } else {
                            console.log('🔐 User authenticated, staying on current page');
                        }
                    } else {
                        console.warn('⚠️ User document not found in Firestore, using cached role or default');
                        this.currentRole = cachedRole || 'user';
                        localStorage.setItem('uid', user.uid);
                        localStorage.setItem('role', this.currentRole);
                        if (this.shouldRedirect()) {
                            console.log('🔐 About to redirect with cached/default role:', this.currentRole);
                            this.performRedirect(this.currentRole);
                        } else {
                            console.log('🔐 User authenticated, staying on current page');
                        }
                    }
                } catch (error) {
                    console.error('❌ Error getting user role:', error);
                    this.currentRole = cachedRole || 'user';
                    localStorage.setItem('uid', user.uid);
                    localStorage.setItem('role', this.currentRole);
                    if (this.shouldRedirect()) {
                        console.log('🔐 About to redirect with fallback role:', this.currentRole);
                        this.performRedirect(this.currentRole);
                    } else {
                        console.log('🔐 User authenticated, staying on current page');
                    }
                }
            } else {
                this.currentRole = null;
                localStorage.removeItem('uid');
                localStorage.removeItem('role');
            }
            
            // Mark as initialized after first run
            this.initialized = true;
        });
    }

    shouldRedirect() {
        const currentPath = window.location.pathname;
        console.log('🔄 Checking if should redirect from path:', currentPath);
        
        // Redirect from login or register pages
        // Also redirect if we haven't initialized yet (first load)
        const shouldRedirect = 
            currentPath.includes('/login/') || 
            currentPath.includes('/register/') ||
            !this.initialized;
        
        console.log('🔄 Should redirect?', shouldRedirect, '(initialized:', this.initialized, ')');
        return shouldRedirect;
    }

    performRedirect(role) {
        const now = Date.now();
        
        // Prevent multiple redirects within 2 seconds
        if (this.redirected && (now - this.lastRedirectTime) < 2000) {
            console.log('🔄 Already redirected recently, ignoring');
            return;
        }
        
        this.redirected = true;
        this.lastRedirectTime = now;
        const currentPath = window.location.pathname;
        console.log('🔄 Performing redirect with role:', role, 'from path:', currentPath);
        
        // Special case: if user is already on home page, don't redirect
        if (role === 'user' && (currentPath === '/' || currentPath === '/index.html')) {
            console.log('🔄 User already on home page, no redirect needed');
            this.redirected = false; // Reset flag since we're not redirecting
            return;
        }
        
        // Special case: if admin is already on admin page, don't redirect
        if (role === 'admin' && currentPath.includes('/admin/')) {
            console.log('🔄 Admin already on admin page, no redirect needed');
            this.redirected = false;
            return;
        }
        
        // Special case: if pharmacy is already on pharmacy page, don't redirect
        if (role === 'pharmacy' && currentPath.includes('/pharmacy/')) {
            console.log('🔄 Pharmacy already on pharmacy page, no redirect needed');
            this.redirected = false;
            return;
        }
        
        // Get the correct base path for redirects
        const isInSubfolder = currentPath.includes('/login/') || 
                             currentPath.includes('/register/');
        const basePath = isInSubfolder ? "../" : "";
        
        console.log('🔄 Base path for redirect:', basePath);
        
        // Redirect based on role
        let redirectUrl;
        if (role === 'admin') {
            redirectUrl = `${basePath}admin/`;
            console.log('👑 Redirecting admin to:', redirectUrl);
        } else if (role === 'pharmacy') {
            redirectUrl = `${basePath}pharmacy/`;
            console.log('💊 Redirecting pharmacy to:', redirectUrl);
        } else {
            redirectUrl = basePath || "./";
            console.log('👤 Redirecting user to home page:', redirectUrl);
        }
        
        console.log('🔄 Final redirect URL:', redirectUrl);
        
        // Perform the redirect immediately
        console.log('🔄 Executing redirect immediately to:', redirectUrl);
        
        // Try immediate redirect first
        try {
            window.location.href = redirectUrl;
        } catch (error) {
            console.error('❌ Immediate redirect failed:', error);
            // Fallback: try with timeout
            setTimeout(() => {
                console.log('🔄 Fallback redirect to:', redirectUrl);
                try {
                    window.location.replace(redirectUrl);
                } catch (error2) {
                    console.error('❌ Fallback redirect also failed:', error2);
                    // Last resort: try location.assign
                    window.location.assign(redirectUrl);
                }
            }, 100);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentRole() {
        return this.currentRole;
    }

    reset() {
        this.currentUser = null;
        this.currentRole = null;
        this.redirected = false;
    }

    // Debug method - call this from console to test redirect
    testRedirect() {
        const role = localStorage.getItem('role');
        console.log('🧪 Testing redirect with role:', role);
        this.redirected = false; // Reset redirect flag
        this.performRedirect(role);
    }
    
    // Debug method - check current state
    debugState() {
        console.log('🔍 AuthManager Debug State:');
        console.log('- Current User:', this.currentUser?.email || 'None');
        console.log('- Current Role:', this.currentRole);
        console.log('- Redirected:', this.redirected);
        console.log('- Initialized:', this.initialized);
        console.log('- Current Path:', window.location.pathname);
        console.log('- Should Redirect:', this.shouldRedirect());
    }
    
    // Force redirect for testing
    forceRedirect() {
        const role = localStorage.getItem('role') || 'user';
        console.log('🧪 Force redirect with role:', role);
        this.redirected = false;
        this.lastRedirectTime = 0;
        this.performRedirect(role);
    }
    
    // Simple test redirect
    testSimpleRedirect() {
        console.log('🧪 Testing simple redirect to home page');
        window.location.href = '../';
    }
    
    // Reset redirect state
    resetRedirectState() {
        this.redirected = false;
        this.lastRedirectTime = 0;
        console.log('🔄 Redirect state reset');
    }
    
    showDisabledAccountError() {
        // Create a professional error modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-6 max-w-md w-full text-center shadow-2xl">
                <div class="flex justify-center mb-4">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Account Disabled</h3>
                <p class="text-gray-600 mb-6">Your account has been disabled by an administrator. Please contact support for assistance.</p>
                <button onclick="this.closest('.fixed').remove()" 
                        class="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                    OK
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

const authManager = new AuthManager();
window.authManager = authManager;
export { authManager };