import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

interface OrderItem {
  name: string;
  price: number;
}

interface Order {
  id: string;
  userName?: string;
  username?: string;
  totalPrice?: number;
  total?: number;
  status?: string;
  createdAt?: unknown;
  ingredients?: OrderItem[];
  selectedIngredients?: OrderItem[];
}

export default function AdminPanel() {
  const [adminName, setAdminName] = useState("Admin");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminProfile() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setAdminName(data.username ?? "Admin");
        }
      } catch (error) {
        console.error("Errore caricamento profilo admin:", error);
      }
    }

    loadAdminProfile();
  }, []);

  useEffect(() => {
    const ordersRef = collection(db, "artifacts", "default-app-id", "public", "data", "orders");
    const q = query(ordersRef, where("status", "==", "pending"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const pendingOrders: Order[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Order[];

        setOrders(pendingOrders);
        setIsLoading(false);
      },
      (error) => {
        console.error("Errore caricamento ordini admin:", error);
        setOrders([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  async function handleMarkReady(orderId: string) {
    try {
      const orderRef = doc(db, "artifacts", "default-app-id", "public", "data", "orders", orderId);
      await updateDoc(orderRef, {
        status: "ready",
        readyAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Errore aggiornamento ordine:", error);
    }
  }

  return (
    <div className="page-shell admin-page">
      <header className="top-header">
        <div className="brand">
          <span className="brand-text">PROJECT</span>
          <img
            src="../../unnamed-removebg-preview.png"
            alt="Smash Burger"
            className="brand-logo"
          />
          <span className="brand-text">SMASH</span>
        </div>
      </header>

      <main className="main-wrapper">
        <div className="container admin-container">
          <section className="admin-hero">
            <p className="admin-kicker">Pannello amministratore</p>
            <h1 className="admin-title">Ciao, {adminName}</h1>
            <p className="admin-subtitle">
              Qui puoi monitorare e gestire gli ordini in arrivo.
            </p>
          </section>

          <section className="admin-card">
            <h2 className="section-title">Ordini in attesa</h2>

            {isLoading ? (
              <div className="admin-empty-state">Caricamento ordini...</div>
            ) : orders.length === 0 ? (
              <div className="admin-empty-state">Nessun ordine in attesa.</div>
            ) : (
              <div className="admin-orders-grid">
                {orders.map((order) => {
                  const displayName = order.userName || order.username || "Utente";
                  const displayTotal = order.totalPrice ?? order.total ?? 0;
                  const displayIngredients =
                    order.selectedIngredients ?? order.ingredients ?? [];

                  return (
                    <article key={order.id} className="admin-order-card">
                      <div className="admin-order-top">
                        <h3 className="admin-order-name">{displayName}</h3>
                        <span className="admin-order-status">In attesa</span>
                      </div>

                      <div className="admin-order-body">
                        <p>
                          <strong>Totale:</strong> € {Number(displayTotal).toFixed(2)}
                        </p>

                        <div>
                          <strong>Ingredienti:</strong>
                          {displayIngredients.length > 0 ? (
                            <ul className="admin-ingredients-list">
                              {displayIngredients.map((item, index) => (
                                <li key={`${order.id}-${item.name}-${index}`}>
                                  {item.name} (€ {Number(item.price).toFixed(2)})
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="admin-order-muted">Nessun dettaglio ingredienti.</p>
                          )}
                        </div>
                      </div>

                      <button
                        className="btn btn-primary"
                        onClick={() => handleMarkReady(order.id)}
                      >
                        Segna come pronto
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}