import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainContent from "../components/MainContent";
import Header from "../components/Header";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import LoadingOverlay from "../components/LoadingOverlay";
import { isUserAdmin } from "../services/adminAuth";

export default function CustomerPage() {
  const { userId, isAuthReady, user } = useFirebaseAuth();
  const navigate = useNavigate();
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!userId) {
      navigate("/login", { replace: true });
      return;
    }

    // Verifica se è admin
    async function checkRole() {
      if (!userId) {
        setIsCheckingRole(false);
        return;
      }
      const admin = await isUserAdmin(userId);
      if (admin) {
        navigate("/admin/dashboard", { replace: true });
      }
      setIsCheckingRole(false);
    }

    checkRole();
  }, [isAuthReady, userId, navigate]);

  if (!isAuthReady || isCheckingRole) return <LoadingOverlay />;
  if (!userId) return <LoadingOverlay />;

  return (
    <div className="page-shell">
      <Header showLogout={true} />

      <main className="main-wrapper">
        <MainContent userId={userId} userName={user?.displayName || "Utente"} />
      </main>
    </div>
  );
}