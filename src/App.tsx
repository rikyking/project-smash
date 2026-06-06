import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "./firebase";
import CustomerPage from "./pages/CustomerPage";
import LoginPage from "./pages/LoginPage";
import PastOrdersPage from "./pages/PastOrdersPage";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";
import AdminPanel from "./components/admin/AdminPanel";
import LoadingOverlay from "./components/LoadingOverlay";

function App() {
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  useEffect(() => {
    // Assicura che la sessione persista nel localStorage
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, () => {
          setIsAuthInitialized(true);
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Errore impostazione persistenza:", error);
        setIsAuthInitialized(true);
      });
  }, []);

  if (!isAuthInitialized) {
    return <LoadingOverlay />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<CustomerPage />} />
        <Route path="/past-orders" element={<PastOrdersPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminPanel />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;