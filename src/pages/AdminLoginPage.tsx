import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { isUserAdmin } from "../services/adminAuth";

export default function AdminLoginPage() {
   const navigate = useNavigate();
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");
   const [isLoading, setIsLoading] = useState(false);

   async function handleLogin(e: React.FormEvent) {
      e.preventDefault();
      setError("");
      setIsLoading(true);

      try {
         const credential = await signInWithEmailAndPassword(auth, email, password);
         const user = credential.user;

         console.log("UID autenticato:", user.uid);

         const admin = await isUserAdmin(user.uid);
         console.log("isAdmin:", admin);

         if (!admin) {
            setError("Utente autenticato ma non autorizzato come admin.");
            return;
         }

         navigate("/admin/dashboard");
      } catch (err) {
         console.error(err);
         setError("Email o password non valide.");
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
            <div className="container" style={{ maxWidth: "520px" }}>
               <h2 className="section-title">Login Admin</h2>

               <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <input
                     type="email"
                     placeholder="Email admin"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="admin-input"
                  />

                  <input
                     type="password"
                     placeholder="Password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="admin-input"
                  />

                  {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}

                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                     {isLoading ? "Accesso in corso..." : "Accedi come admin"}
                  </button>
               </form>
            </div>
         </main>
      </div>
   );
}