// src/hooks/useFirebaseAuth.ts
import { useState, useEffect } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";

interface FirebaseAuthState {
  userId: string | null;
  isAuthReady: boolean;
  user: User | null;
}

export function useFirebaseAuth(): FirebaseAuthState {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setUserId(firebaseUser.uid);
      } else {
        // Nessun utente → login anonimo
        try {
          const credential = await signInAnonymously(auth);
          setUser(credential.user);
          setUserId(credential.user.uid);
        } catch (error) {
          console.error("Errore login anonimo:", error);
          setUserId(null);
        }
      }
      setIsAuthReady(true);
    });

    // Cleanup: smette di ascoltare quando il componente si smonta
    return () => unsubscribe();
  }, []);

  return { userId, isAuthReady, user };
}