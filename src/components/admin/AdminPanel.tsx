import { useState } from "react";
import { useAdminOrders } from "../../hooks/useAdminOrders";
import { markOrderAsReady } from "../../services/adminService";
import type { Order } from "../../types/order";
import LoadingOverlay from "../LoadingOverlay";

function AdminOrderCard({
  order,
  onMarkReady,
}: {
  order: Order;
  onMarkReady: (id: string) => void;
}) {
  const ingredientsList = [
    order.bread?.name,
    order.meat?.name,
    ...(order.cheese ?? []).map((c) => c.name),
    ...(order.veg ?? []).map((v) => v.name),
    ...(order.sauce ?? []).map((s) => s.name),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="order-item">
      <p>
        <strong>Nome:</strong> {order.name}
      </p>
      <p>
        <strong>Ingredienti:</strong> {ingredientsList}
      </p>
      <p>
        <strong>Totale:</strong> €{order.totalPrice?.toFixed(2) ?? "0.00"}
      </p>
      <p>
        <strong>Ora ordine:</strong>{" "}
        {order.timestamp
          ? new Date(order.timestamp.toDate()).toLocaleString("it-IT")
          : "N/A"}
      </p>
      <button
        className="btn btn-primary"
        style={{ marginTop: "0.75rem" }}
        onClick={() => onMarkReady(order.id)}
      >
        Segna come Pronto ✅
      </button>
    </div>
  );
}

export default function AdminPanel() {
  const { orders, isLoading } = useAdminOrders();
  const [actionLoading, setActionLoading] = useState(false);

  async function handleMarkReady(orderId: string) {
    setActionLoading(true);
    try {
      await markOrderAsReady(orderId);
    } catch (error) {
      console.error("Errore:", error);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <>
      {actionLoading && <LoadingOverlay />}

      <div className="container">
        <h1 className="section-title">🍔 Pannello Amministratore</h1>

        {isLoading && (
          <p style={{ color: "#6b7280" }}>Caricamento ordini in corso...</p>
        )}

        {!isLoading && orders.length === 0 && (
          <p style={{ color: "#6b7280" }}>Nessun ordine in attesa. 🎉</p>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="order-list">
            {orders.map((order) => (
              <AdminOrderCard
                key={order.id}
                order={order}
                onMarkReady={handleMarkReady}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}