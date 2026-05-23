import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

let currentUserRole: string | null = null;

export async function isUserAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.warn(`Documento utente non trovato per ID: ${userId}`);
      return false;
    }

    const userData = userDocSnap.data();
    currentUserRole = userData.role ?? null;

    return userData.role === "admin";
  } catch (error) {
    console.error("Errore verifica ruolo admin:", error);
    return false;
  }
}

export function getCurrentUserRole(): string | null {
  return currentUserRole;
}

export function clearUserRoleCache(): void {
  currentUserRole = null;
}