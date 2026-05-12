/**
 * Admin Authentication Module
 * Handles secure admin authentication using Firebase Auth
 * Replaces the previous hardcoded "RIC-ADMIN" check
 */

import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let currentUserRole = null;

/**
 * Check if user has admin role in Firestore
 * @param {string} userId - Firebase user ID
 * @param {Object} db - Firestore database instance
 * @returns {Promise<boolean>} True if user is admin
 */
export async function isUserAdmin(userId, db) {
  if (!userId || !db) {
    return false;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.warn(`User document not found for ID: ${userId}`);
      return false;
    }

    const userData = userDocSnap.data();
    const isAdmin = userData.role === 'admin';

    // Cache the role
    currentUserRole = userData.role || null;

    return isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Authenticate admin user with email and password
 * @param {Object} auth - Firebase Auth instance
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<Object>} User credential object
 */
export async function authenticateAdmin(auth, email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Admin authentication failed:', error);
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

/**
 * Get current user's role (from cache)
 * @returns {string|null} Current role or null
 */
export function getCurrentUserRole() {
  return currentUserRole;
}

/**
 * Clear user role cache (on logout)
 */
export function clearUserRoleCache() {
  currentUserRole = null;
}
