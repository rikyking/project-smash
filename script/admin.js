/**
 * Admin Panel Module
 * Handles admin-specific UI and operations
 */

import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { isUserAdmin } from './admin-auth.js';

let db = null;
let auth = null;
let appId = null;

export function initAdminModule(firestore, firebaseAuth, applicationId) {
  db = firestore;
  auth = firebaseAuth;
  appId = applicationId;
}

/**
 * Check if user should have access to admin panel
 * @param {string} userId - Firebase user ID
 * @returns {Promise<boolean>}
 */
export async function checkAdminAccess(userId) {
  if (!userId) {
    return false;
  }

  try {
    return await isUserAdmin(userId, db);
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

/**
 * Fetch and render pending orders for admin panel
 * @param {Function} renderCallback - Function to render orders
 */
export function listenToPendingOrders(renderCallback) {
  if (!db || !appId) {
    console.error('Admin module not initialized');
    return () => {};
  }

  const ordersCollectionRef = collection(db, `artifacts/${appId}/public/data/orders`);
  const q = query(ordersCollectionRef, where('status', '==', 'pending'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const orders = [];
      snapshot.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...docSnap.data() });
      });
      renderCallback(orders);
    },
    (error) => {
      console.error('Error fetching pending orders:', error);
      renderCallback([]);
    }
  );

  return unsubscribe; // Return function to stop listening
}

/**
 * Mark order as ready
 * @param {string} orderId - Order document ID
 * @returns {Promise<void>}
 */
export async function markOrderAsReady(orderId) {
  if (!db || !appId) {
    throw new Error('Admin module not initialized');
  }

  if (!orderId) {
    throw new Error('Order ID is required');
  }

  try {
    const orderRef = doc(db, `artifacts/${appId}/public/data/orders`, orderId);
    await updateDoc(orderRef, {
      status: 'ready',
      readyAt: new Date().toISOString(),
    });
    console.log(`Order ${orderId} marked as ready`);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error(`Failed to update order: ${error.message}`);
  }
}
