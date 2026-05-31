import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { isUserAdmin } from "../services/adminAuth";
import LoadingOverlay from "../components/LoadingOverlay";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: Props) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setIsAllowed(false);
        setIsChecking(false);
        return;
      }

      const admin = await isUserAdmin(user.uid);
      setIsAllowed(admin);
      setIsChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (isChecking) return <LoadingOverlay />;

  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}