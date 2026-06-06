import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PastOrders from "../components/PastOrders";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import LoadingOverlay from "../components/LoadingOverlay";

export default function PastOrdersPage() {
  const { userId, isAuthReady } = useFirebaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthReady && !userId) {
      navigate("/login", { replace: true });
    }
  }, [isAuthReady, userId, navigate]);

  if (!isAuthReady) return <LoadingOverlay />;
  if (!userId) return <LoadingOverlay />;

  return (
    <div className="page-shell">
      <Header showLogout={true} />

      <main className="main-wrapper">
        <div className="container">
          <section className="intro-section">
          </section>
          <PastOrders userId={userId} />
        </div>
      </main>
    </div>
  );
}
