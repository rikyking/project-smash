import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import type { AuthError } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import showIcon from "../assets/show.png";
import hideIcon from "../assets/hide.png";

type Mode = "login" | "register";

export default function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setEmail("");
    setPassword("");
    setUsername("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "register") {
        if (!username.trim()) {
          setError("Inserisci un nome utente.");
          setIsLoading(false);
          return;
        }

        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const user = credential.user;

        await updateProfile(user, {
          displayName: username.trim(),
        });

        try {
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            username: username.trim(),
            role: "user",
            createdAt: new Date().toISOString(),
          });
        } catch (firestoreError) {
          console.error("Errore salvataggio profilo Firestore:", firestoreError);
        }

        navigate("/", { replace: true });
        return;
      }

      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = credential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      const role = userDocSnap.exists() ? userDocSnap.data().role : "user";

      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      console.error(err);

      const errorCode = (err as AuthError).code;

      switch (errorCode) {
        case "auth/email-already-in-use":
          setError("Email già in uso. Prova ad accedere.");
          break;
        case "auth/weak-password":
          setError("Password troppo corta (min. 6 caratteri).");
          break;
        case "auth/invalid-email":
          setError("Email non valida.");
          break;
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError("Email o password non valide.");
          break;
        default:
          setError("Errore imprevisto. Riprova.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <header className="top-header">
        <div className="brand">
          <span className="brand-text">PROJECT</span>
          <img
            src="/unnamed-removebg-preview.png"
            alt="Smash Burger"
            className="brand-logo"
          />
          <span className="brand-text">SMASH</span>
        </div>
      </header>

      <main className="main-wrapper">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "auth-tab--active" : ""}`}
              onClick={() => switchMode("login")}
            >
              Accedi
            </button>

            <button
              type="button"
              className={`auth-tab ${mode === "register" ? "auth-tab--active" : ""}`}
              onClick={() => switchMode("register")}
            >
              Registrati
            </button>
          </div>

          <p className="auth-subtitle">
            {mode === "login"
              ? "Bentornato! Inserisci le tue credenziali."
              : "Crea il tuo account per ordinare."}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "register" && (
              <div className="auth-field">
                <label htmlFor="username">Nome utente</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Es. Mario"
                  required
                  autoComplete="username"
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="password-field-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 caratteri"
                  required
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                >
                  <img src={showPassword ? hideIcon : showIcon} alt={showPassword ? 'Nascondi password' : 'Mostra password'} />
                </button>
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading
                ? "Caricamento..."
                : mode === "login"
                ? "Accedi"
                : "Crea account"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}