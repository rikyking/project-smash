import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";

interface FirebaseAuthState {
  userId: string | null;
  isAuthReady: boolean;
  user: User | null;
}

export function useFirebaseAuth(): FirebaseAuthState {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setUserId(firebaseUser.uid);
      } else {
        setUser(null);
        setUserId(null);
      }

      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  return { userId, isAuthReady, user };
}