import logo from '/unnamed-removebg-preview.png';
import UserMenu from './UserMenu';

interface Props {
  userLabel?: string;
  showLogout?: boolean;
}

export default function Header({ userLabel, showLogout }: Props) {
  const hasActions = userLabel || showLogout;

  return (
    <header className={`top-header ${hasActions ? 'top-header--with-actions' : ''}`}>
      <div className="brand">
        <a href="/" className="brand-link">
          <span className="brand-text">PROJECT</span>
          <img
            src={logo}
            alt="Smash Burger"
            className="brand-logo"
          />
          <span className="brand-text">SMASH</span>
        </a>
      </div>

      {hasActions && (
        <div className="header-actions">
          {userLabel && <span className="header-user">{userLabel}</span>}
          {showLogout && <UserMenu />}
        </div>
      )}
    </header>
  );
}