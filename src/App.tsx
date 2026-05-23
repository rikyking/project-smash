// src/App.tsx
import { useFirebaseAuth } from "./hooks/useFirebaseAuth";
import LoadingOverlay from "./components/LoadingOverlay";
import MainContent from "./components/MainContent";
import AdminPanel from "./components/admin/AdminPanel";
import { useEffect, useState } from "react";
import { checkAdminAccess } from "./services/adminService";

function App() {
  const { userId, isAuthReady } = useFirebaseAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Quando l'auth è pronta, controlla se l'utente è admin
  useEffect(() => {
    if (!isAuthReady || !userId) return;

    checkAdminAccess(userId).then((result) => {
      setIsAdmin(result);
    });
  }, [isAuthReady, userId]);

  // Mostra lo spinner finché Firebase non è pronto
  if (!isAuthReady) return <LoadingOverlay />;

  // Scelta vista: admin o cliente
  return isAdmin
    ? <AdminPanel />
    : <MainContent userId={userId!} />;
}

export default App;