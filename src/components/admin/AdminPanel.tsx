import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
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
import type { Order } from "../../types/order";

export default function AdminPanel() {
  const navigate = useNavigate();

  const [adminName, setAdminName] = useState("Admin");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    const ordersRef = collection(
      db,
      "artifacts",
      "default-app-id",
      "public",
      "data",
      "orders"
    );

    const q = query(ordersRef, where("status", "==", "pending"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const pendingOrders: Order[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Order, "id">),
        }));

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
      const orderRef = doc(
        db,
        "artifacts",
        "default-app-id",
        "public",
        "data",
        "orders",
        orderId
      );

      await updateDoc(orderRef, {
        status: "ready",
        readyAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Errore aggiornamento ordine:", error);
    }
  }

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Errore logout admin:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="page-shell admin-page">
      <header className="top-header top-header--with-actions">
        <div className="brand">
          <span className="brand-text">PROJECT</span>
          <img
            src="/unnamed-removebg-preview.png"
            alt="Smash Burger"
            className="brand-logo"
          />
          <span className="brand-text">SMASH</span>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-logout"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Uscita..." : "Logout"}
          </button>
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
                  const displayTotal = order.totalPrice ?? 0;
                  const bread = order.bread;
                  const meat = order.meat;
                  const cheese = Array.isArray(order.cheese) ? order.cheese : [];
                  const sauce = Array.isArray(order.sauce) ? order.sauce : [];
                  const orderName = order.name;

                  return (
                    <article key={order.id} className="admin-order-card">
                      <div className="admin-order-top">
                        <h4 className="admin-order-time">
                          Order time:{" "}
                          {order.timestamp
                            ? order.timestamp.toDate().toLocaleTimeString()
                            : "--:--"}
                        </h4>
                        <span className="admin-order-status">In attesa</span>
                      </div>

                      <div className="admin-order-body">
                        {orderName && (
                          <p>
                            <strong>Ordine:</strong> {orderName}
                          </p>
                        )}

                        <p>
                          <strong>Totale:</strong> €{" "}
                          {Number(displayTotal).toFixed(2)}
                        </p>

                        <div>
                          <strong>Dettaglio ordine:</strong>

                          <ul className="admin-ingredients-list">
                            {bread && (
                              <li>
                                <strong>Pane:</strong> {bread.name}
                              </li>
                            )}

                            {meat && (
                              <li>
                                <strong>Carne:</strong> {meat.name}
                              </li>
                            )}

                            {cheese.map((item, index) => (
                              <li key={`${order.id}-cheese-${index}`}>
                                <strong>Formaggio:</strong> {item.name}
                              </li>
                            ))}

                            {sauce.map((item, index) => (
                              <li key={`${order.id}-sauce-${index}`}>
                                <strong>Salsa:</strong> {item.name}
                              </li>
                            ))}
                          </ul>

                          {!bread &&
                            !meat &&
                            cheese.length === 0 &&
                            sauce.length === 0 && (
                              <p className="admin-order-muted">
                                Nessun dettaglio disponibile.
                              </p>
                            )}
                        </div>
                      </div>

                      <button
                        className="btn btn-primary"
                        onClick={() => order.id && handleMarkReady(order.id)}
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