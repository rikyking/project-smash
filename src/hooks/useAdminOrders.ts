import { useState, useEffect } from "react";
import { listenToPendingOrders } from "../services/adminService";
import type { Order } from "../types/order";

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToPendingOrders((incoming) => {
      setOrders(incoming);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { orders, isLoading };
}