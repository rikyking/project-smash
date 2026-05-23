import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db, appId } from "../firebase";
import type { Order } from "../types/order";

export function useOrders(userId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const ordersRef = collection(db, `artifacts/${appId}/public/data/orders`);
    const q = query(ordersRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const allOrders: Order[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          // Filtra solo gli ordini dell'utente corrente
          if (data.userId === userId) {
            allOrders.push({ id: doc.id, ...data } as Order);
          }
        });

        // Ordina per data decrescente (più recente prima)
        allOrders.sort((a, b) => {
          const dateA = a.timestamp?.toDate().getTime() ?? 0;
          const dateB = b.timestamp?.toDate().getTime() ?? 0;
          return dateB - dateA;
        });

        setOrders(allOrders);
        setIsLoading(false);
      },
      (err) => {
        console.error("Errore fetch ordini:", err);
        setError("Errore nel caricamento degli ordini.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { orders, isLoading, error };
}