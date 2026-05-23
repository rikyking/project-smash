import { useOrders } from "../hooks/useOrders";
import type { Order } from "../types/order";

interface Props {
  userId: string;
}

function OrderCard({ order }: { order: Order }) {
  const isReady = order.status === "ready";
  const statusText = isReady ? "Pronto ✅" : "In preparazione ⏳";
  const statusColor = isReady ? "#10b981" : "#f59e0b";

  const ingredientsList = [
    order.bread && `Panino: ${order.bread.name}`,
    order.meat && `Carne: ${order.meat.name}`,
    order.cheese?.length && `Formaggi: ${order.cheese.map((c) => c.name).join(", ")}`,
    order.veg?.length && `Verdure: ${order.veg.map((v) => v.name).join(", ")}`,
    order.sauce?.length && `Salse: ${order.sauce.map((s) => s.name).join(", ")}`,
  ].filter(Boolean);

  return (
    <div className="order-item">
      <p>
        <strong>Nome:</strong> {order.name}
      </p>
      {ingredientsList.map((line, i) => (
        <p key={i}>{line as string}</p>
      ))}
      <p>
        <strong>Totale:</strong> €{order.totalPrice?.toFixed(2) ?? "0.00"}
      </p>
      <p>
        <strong>Stato:</strong>{" "}
        <span style={{ color: statusColor, fontWeight: 600 }}>{statusText}</span>
      </p>
      {order.timestamp && (
        <p>
          <strong>Data:</strong>{" "}
          {new Date(order.timestamp.toDate()).toLocaleString("it-IT")}
        </p>
      )}
    </div>
  );
}

export default function PastOrders({ userId }: Props) {
  const { orders, isLoading, error } = useOrders(userId);

  return (
    <section>
      <h2 className="section-title">I tuoi ordini precedenti</h2>

      {isLoading && (
        <p style={{ color: "#6b7280" }}>Caricamento ordini in corso...</p>
      )}

      {error && (
        <p style={{ color: "#ef4444" }}>{error}</p>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="order-list">
          <div className="empty-orders">Nessun ordine precedente.</div>
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="order-list">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}