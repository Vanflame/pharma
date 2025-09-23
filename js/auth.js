// Auth helpers and role-based redirect logic for PHARMA DIRECT
// Import this as a module in auth-related pages

import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut, deleteUser } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, runTransaction } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { firebaseConfig, COLLECTIONS } from "./firebase.js";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Clear redirecting flag on page load
window.addEventListener('load', () => {
    delete window.redirecting;
    console.log('🔄 Page loaded, cleared redirecting flag');
});

export async function registerUser({ name, email, password, phone, role = "user" }) {
    console.log('📝 registerUser: Starting registration for:', { email, role });
    
    let authUser = null;
    
    try {
        // Step 1: Create user in Firebase Auth first (required for UID)
        console.log('📝 registerUser: Creating user in Firebase Auth...');
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        authUser = cred.user;
        console.log('📝 registerUser: User created in Auth, UID:', authUser.uid);
        
        // Step 2: Update user profile
        console.log('📝 registerUser: Updating user profile...');
        await updateProfile(authUser, { displayName: name });
        console.log('📝 registerUser: Profile updated successfully');
        
        // Step 3: Prepare user data for Firestore
        const userData = {
            name,
            email,
            phone: phone || "",
            role,
            disabled: false,
            successfulOrders: 0,
            totalSpent: 0,
            codUnlocked: role === "admin" ? true : false,
            createdAt: Date.now()
        };
        
        // Step 4: Save user data to Firestore (user is now authenticated)
        console.log('📝 registerUser: Saving user data to Firestore...');
        
        const userRef = doc(db, COLLECTIONS.users, authUser.uid);
        
        try {
            // Use transaction to ensure atomicity
            await runTransaction(db, async (transaction) => {
                // Check if user document already exists
                const userDoc = await transaction.get(userRef);
                if (userDoc.exists()) {
                    throw new Error('User document already exists');
                }
                
                // Set user document
                transaction.set(userRef, userData);
                
                // If pharmacy, also create pharmacy document
                if (role === "pharmacy") {
                    const pharmRef = doc(db, COLLECTIONS.pharmacies, authUser.uid);
                    const pharmacyData = {
                        name,
                        email,
                        phone: phone || "",
                        approved: false,
                        products: [],
                        totalOrders: 0
                    };
                    transaction.set(pharmRef, pharmacyData);
                }
            });
            
            console.log('📝 registerUser: User data saved to Firestore successfully');
        } catch (firestoreError) {
            console.error('❌ registerUser: Firestore transaction failed:', firestoreError);
            console.error('❌ registerUser: Firestore error details:', {
                code: firestoreError.code,
                message: firestoreError.message,
                stack: firestoreError.stack
            });
            
            // Clean up: Delete the Auth user since Firestore failed
            console.log('📝 registerUser: Cleaning up failed registration - deleting Auth user...');
            try {
                await deleteUser(authUser);
                console.log('📝 registerUser: User deleted from Auth successfully');
            } catch (deleteError) {
                console.error('❌ registerUser: Failed to delete user from Auth:', deleteError);
                // If deletion fails, ensure sign-out to avoid a half-registered session
                try { 
                    await signOut(auth); 
                    console.log('📝 registerUser: User signed out as fallback');
                } catch (signOutError) {
                    console.error('❌ registerUser: Failed to sign out user:', signOutError);
                }
            }
            
            throw firestoreError;
        }
        
        // Step 5: Save to localStorage
        try {
            localStorage.setItem('uid', authUser.uid);
            localStorage.setItem('role', role);
            console.log('📝 registerUser: Data saved to localStorage');
        } catch (localError) {
            console.warn('📝 registerUser: Failed to save to localStorage:', localError);
        }
        
        console.log('📝 registerUser: Registration completed successfully');
        return authUser;
        
    } catch (error) {
        console.error('❌ registerUser: Registration failed:', error);
        console.error('❌ registerUser: Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        
        // Clean up: If we created an Auth user but something failed, delete it
        if (authUser) {
            console.log('📝 registerUser: Cleaning up failed registration - deleting Auth user...');
            try {
                await deleteUser(authUser);
                console.log('📝 registerUser: User deleted from Auth successfully');
            } catch (deleteError) {
                console.error('❌ registerUser: Failed to delete user from Auth:', deleteError);
                // If deletion fails, ensure sign-out to avoid a half-registered session
                try { 
                    await signOut(auth); 
                    console.log('📝 registerUser: User signed out as fallback');
                } catch (signOutError) {
                    console.error('❌ registerUser: Failed to sign out user:', signOutError);
                }
            }
        }
        
        // Clear localStorage
        try {
            localStorage.removeItem('uid');
            localStorage.removeItem('role');
            console.log('📝 registerUser: Cleared localStorage');
        } catch (localError) {
            console.warn('📝 registerUser: Failed to clear localStorage:', localError);
        }
        
        throw error;
    }
}

export async function loginUser({ email, password }) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    try {
        // Fetch full user document to check if account is disabled
        const userDoc = await fetchUserDoc(cred.user.uid);
        console.log('🔐 loginUser: Fetched user document:', userDoc);
        
        // Check if account is disabled
        console.log('🔐 loginUser: Checking if account is disabled:', userDoc?.disabled);
        if (userDoc && userDoc.disabled === true) {
            console.log('🚫 loginUser: Account is disabled - redirecting to disabled page');
            // Sign out the user immediately
            await signOut(auth);
            console.log('🚫 loginUser: User signed out successfully');
            // Redirect to disabled page
            window.location.href = '../disabled/';
            return; // Don't proceed with normal login
        }
        console.log('✅ loginUser: Account is enabled, proceeding with login');
        
        const role = userDoc?.role || 'user';
        console.log('🔐 loginUser: User role:', role);
        localStorage.setItem('uid', cred.user.uid);
        localStorage.setItem('role', role);
        console.log('🔐 loginUser: Stored role in localStorage:', role);
        return cred.user;
    } catch (error) {
        console.error('❌ loginUser: Login failed:', error);
        // Sign out the user if we can't get their role or account is disabled
        try {
            await signOut(auth);
        } catch (signOutError) {
            console.error('❌ loginUser: Failed to sign out user:', signOutError);
        }
        throw error;
    }
}

export async function fetchUserRole(uid) {
    console.log('🔍 fetchUserRole: Fetching role for uid:', uid);
    const docRef = doc(db, COLLECTIONS.users, uid);
    const snap = await getDoc(docRef);
    const exists = snap.exists();
    const data = exists ? snap.data() : null;
    const role = exists ? (data.role || "user") : "user";
    console.log('🔍 fetchUserRole: Document exists:', exists, 'Data:', data, 'Role:', role);
    return role;
}

export async function fetchUserDoc(uid) {
    console.log('🔍 fetchUserDoc: Fetching document for uid:', uid);
    const ref = doc(db, COLLECTIONS.users, uid);
    const snap = await getDoc(ref);
    console.log('🔍 fetchUserDoc: Document exists:', snap.exists());
    if (snap.exists()) {
        const data = snap.data();
        console.log('🔍 fetchUserDoc: Document data:', data);
        return data;
    }
    console.log('🔍 fetchUserDoc: Document does not exist');
    return null;
}

// Helper function removed - now handled by authManager

// Redirect function removed - now handled by authManager

// watchAuthAndRedirect function removed - now handled by authManager

export function logout() {
    try { 
        localStorage.removeItem('uid'); 
        localStorage.removeItem('role'); 
        // Clear redirecting flag
        delete window.redirecting;
        
        // Clear auth manager state
        if (window.authManager) {
            window.authManager.reset();
            console.log('🚪 Logout: Reset auth manager state');
        }
    } catch { }
    
    return signOut(auth).then(() => {
        console.log('🚪 Logout successful, redirecting to login');
        // Redirect to login page after successful logout
        const isInSubfolder = window.location.pathname.includes('/admin/') || 
                             window.location.pathname.includes('/pharmacy/') || 
                             window.location.pathname.includes('/user-dashboard/') || 
                             window.location.pathname.includes('/categories/') || 
                             window.location.pathname.includes('/track/') || 
                             window.location.pathname.includes('/cart/') || 
                             window.location.pathname.includes('/addresses/') || 
                             window.location.pathname.includes('/pay/') || 
                             window.location.pathname.includes('/product/') || 
                             window.location.pathname.includes('/disabled/');
        const basePath = isInSubfolder ? "../" : "";
        window.location.href = `${basePath}login/`;
    }).catch((error) => {
        console.error('❌ Logout error:', error);
        // Still redirect even if there's an error
        const isInSubfolder = window.location.pathname.includes('/admin/') || 
                             window.location.pathname.includes('/pharmacy/') || 
                             window.location.pathname.includes('/user-dashboard/') || 
                             window.location.pathname.includes('/categories/') || 
                             window.location.pathname.includes('/track/') || 
                             window.location.pathname.includes('/cart/') || 
                             window.location.pathname.includes('/addresses/') || 
                             window.location.pathname.includes('/pay/') || 
                             window.location.pathname.includes('/product/') || 
                             window.location.pathname.includes('/disabled/');
        const basePath = isInSubfolder ? "../" : "";
        window.location.href = `${basePath}login/`;
    });
}

// Simple form utilities
export function getFormData(form) {
    const data = new FormData(form);
    return Object.fromEntries(data.entries());
}


