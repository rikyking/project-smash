import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, appId } from "../firebase";
import { isUserAdmin } from "./adminAuth";
import type { Order } from "../types/order";

export async function checkAdminAccess(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    return await isUserAdmin(userId);
  } catch (error) {
    console.error("Errore controllo accesso admin:", error);
    return false;
  }
}

export function listenToPendingOrders(
  callback: (orders: Order[]) => void
): () => void {
  const ordersRef = collection(db, `artifacts/${appId}/public/data/orders`);
  const q = query(ordersRef, where("status", "==", "pending"));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      // Ordina per data crescente: prima arrivato, primo servito
      orders.sort((a, b) => {
        const dateA = a.timestamp?.toDate().getTime() ?? 0;
        const dateB = b.timestamp?.toDate().getTime() ?? 0;
        return dateA - dateB;
      });
      callback(orders);
    },
    (error) => {
      console.error("Errore fetch ordini admin:", error);
      callback([]);
    }
  );

  return unsubscribe;
}

export async function markOrderAsReady(orderId: string): Promise<void> {
  if (!orderId) throw new Error("Order ID obbligatorio");

  try {
    const orderRef = doc(db, `artifacts/${appId}/public/data/orders`, orderId);
    await updateDoc(orderRef, {
      status: "ready",
      readyAt: new Date().toISOString(),
    });
    console.log(`Ordine ${orderId} segnato come pronto`);
  } catch (error) {
    console.error("Errore aggiornamento ordine:", error);
    throw new Error("Aggiornamento fallito", { cause: error });
  }
}