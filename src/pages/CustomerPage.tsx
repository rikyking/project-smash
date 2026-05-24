import MainContent from "../components/MainContent";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import LoadingOverlay from "../components/LoadingOverlay";

export default function CustomerPage() {
  const { userId, isAuthReady } = useFirebaseAuth();

  if (!isAuthReady) return <LoadingOverlay />;
  if (!userId) return <div>Errore autenticazione utente.</div>;

  return <MainContent userId={userId} />;
}