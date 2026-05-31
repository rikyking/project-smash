import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import logo from '/unnamed-removebg-preview.png';

interface Props {
  userLabel?: string;
}

export default function Header({ userLabel }: Props) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Errore logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className={`top-header ${userLabel ? 'top-header--with-actions' : ''}`}>
      <div className="brand">
        <span className="brand-text">PROJECT</span>
        <img
          src={logo}
          alt="Smash Burger"
          className="brand-logo"
        />
        <span className="brand-text">SMASH</span>
      </div>

      {userLabel && (
        <div className="header-actions">
          <span className="header-user">{userLabel}</span>
          <button
            type="button"
            className="btn btn-logout"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Uscita...' : 'Logout'}
          </button>
        </div>
      )}
    </header>
  );
}