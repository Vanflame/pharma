// Auth helpers and role-based redirect logic for PHARMA DIRECT
// Import this as a module in auth-related pages

import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut, deleteUser } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
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
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    try {
        await updateProfile(cred.user, { displayName: name });
        const userRef = doc(db, COLLECTIONS.users, cred.user.uid);
        await setDoc(userRef, {
            name,
            email,
            phone: phone || "",
            role,
            disabled: false,
            successfulOrders: 0,
            totalSpent: 0,
            codUnlocked: role === "admin" ? true : false,
            createdAt: Date.now()
        });
        if (role === "pharmacy") {
            const pharmRef = doc(db, COLLECTIONS.pharmacies, cred.user.uid);
            await setDoc(pharmRef, {
                name,
                email,
                phone: phone || "",
                approved: false,
                products: [],
                totalOrders: 0
            }, { merge: true });
        }
        try {
            localStorage.setItem('uid', cred.user.uid);
            localStorage.setItem('role', role);
        } catch { }
        return cred.user;
    } catch (error) {
        try {
            await deleteUser(cred.user);
        } catch {
            // If deletion fails, ensure sign-out to avoid a half-registered session
            try { await signOut(auth); } catch { }
        }
        throw error;
    }
}

export async function loginUser({ email, password }) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    try {
        const role = await fetchUserRole(cred.user.uid);
        console.log('🔐 loginUser: Fetched role from database:', role);
        localStorage.setItem('uid', cred.user.uid);
        localStorage.setItem('role', role);
        console.log('🔐 loginUser: Stored role in localStorage:', role);
    } catch (error) {
        console.error('❌ loginUser: Error fetching role:', error);
        // Set default role if fetch fails
        localStorage.setItem('uid', cred.user.uid);
        localStorage.setItem('role', 'user');
        console.log('🔐 loginUser: Set default role "user" due to error');
    }
    return cred.user;
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
    const ref = doc(db, COLLECTIONS.users, uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
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


