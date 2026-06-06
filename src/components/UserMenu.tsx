import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

interface Props {
   onLogout?: () => void;
}

export default function UserMenu({ onLogout }: Props) {
   const navigate = useNavigate();
   const [isOpen, setIsOpen] = useState(false);
   const [isLoggingOut, setIsLoggingOut] = useState(false);

   const handleLogout = async () => {
      try {
         setIsLoggingOut(true);
         await signOut(auth);
         navigate('/login', { replace: true });
         onLogout?.();
      } catch (error) {
         console.error('Errore logout:', error);
      } finally {
         setIsLoggingOut(false);
      }
   };

   const handleMenuClick = (callback?: () => void) => {
      callback?.();
      setIsOpen(false);
   };

   return (
      <div className="user-menu-container">
         <button
            className="hamburger-btn"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
            aria-expanded={isOpen}
         >
            <span></span>
            <span></span>
            <span></span>
         </button>

         {isOpen && (
            <div className="user-menu-overlay" onClick={() => setIsOpen(false)} />
         )}

         <div className={`user-menu ${isOpen ? 'user-menu--open' : ''}`}>
            <nav className="user-menu-nav">
               <button
                  type="button"
                  className="user-menu-item user-menu-item--link"
                  onClick={() => handleMenuClick(() => navigate('/'))}
               >
                  Home
               </button>
               <button
                  type="button"
                  className="user-menu-item user-menu-item--link"
                  onClick={() => handleMenuClick(() => navigate('/past-orders'))}
               >
                  I miei ordini
               </button>

               <div className="user-menu-divider"></div>

               <button
                  type="button"
                  className="user-menu-item user-menu-item--logout"
                  onClick={() => handleMenuClick(handleLogout)}
                  disabled={isLoggingOut}
               >
                  {isLoggingOut ? 'Uscita...' : 'Logout'}
               </button>
            </nav>
         </div>
      </div>
   );
}
