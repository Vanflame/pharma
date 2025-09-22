// Auth helpers and role-based redirect logic for PHARMA DIRECT
// Import this as a module in auth-related pages

import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut, deleteUser } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { firebaseConfig, COLLECTIONS } from "./firebase.js";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
        localStorage.setItem('uid', cred.user.uid);
        localStorage.setItem('role', role);
    } catch { }
    return cred.user;
}

export async function fetchUserRole(uid) {
    const docRef = doc(db, COLLECTIONS.users, uid);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data().role || "user") : "user";
}

export async function fetchUserDoc(uid) {
    const ref = doc(db, COLLECTIONS.users, uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
}

// Helper function to get the correct base path for redirects
function getRedirectBasePath() {
    const isInSubfolder = window.location.pathname.includes('/login/') || 
                         window.location.pathname.includes('/register/') || 
                         window.location.pathname.includes('/admin/') || 
                         window.location.pathname.includes('/pharmacy/') || 
                         window.location.pathname.includes('/user-dashboard/') || 
                         window.location.pathname.includes('/categories/') || 
                         window.location.pathname.includes('/track/') || 
                         window.location.pathname.includes('/cart/') || 
                         window.location.pathname.includes('/addresses/') || 
                         window.location.pathname.includes('/pay/') || 
                         window.location.pathname.includes('/product/') || 
                         window.location.pathname.includes('/disabled/');
    return isInSubfolder ? "../" : "";
}

export function redirectByRole(role) {
    const basePath = getRedirectBasePath();
    
    // Redirect all users to landing page after successful login/register
    window.location.href = basePath || "./";
}

export function watchAuthAndRedirect() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) return;
        const u = await fetchUserDoc(user.uid);
        if (u && u.disabled) {
            const basePath = getRedirectBasePath();
            window.location.href = `${basePath}disabled/`;
            return;
        }
        const role = u?.role || "user";
        redirectByRole(role);
    });
}

export function logout() {
    try { 
        localStorage.removeItem('uid'); 
        localStorage.removeItem('role'); 
    } catch { }
    
    return signOut(auth).then(() => {
        // Redirect to login page after successful logout
        const basePath = getRedirectBasePath();
        window.location.href = `${basePath}login/`;
    }).catch((error) => {
        console.error('Logout error:', error);
        // Still redirect even if there's an error
        const basePath = getRedirectBasePath();
        window.location.href = `${basePath}login/`;
    });
}

// Simple form utilities
export function getFormData(form) {
    const data = new FormData(form);
    return Object.fromEntries(data.entries());
}


