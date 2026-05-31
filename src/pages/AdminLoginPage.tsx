import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainContent from "../components/MainContent";
import Header from "../components/Header";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import LoadingOverlay from "../components/LoadingOverlay";

export default function CustomerPage() {
  const { userId, isAuthReady, user } = useFirebaseAuth();
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
      <Header userLabel={user?.displayName || user?.email || "Utente"} />

      <main className="main-wrapper">
        <MainContent userId={userId} />
      </main>
    </div>
  );
}