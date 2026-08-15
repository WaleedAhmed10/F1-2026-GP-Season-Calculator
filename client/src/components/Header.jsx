export default function Header({ user, onAuthClick, onSignOut }) {
  return (
    <header className="app-header">
      <div className="logo-area">
        <i className="fas fa-flag-checkered" />
        <h1>F1 Season Calculator</h1>
        <span>2026</span>
      </div>
      <div className="auth-section">
        <div className="user-badge" onClick={onAuthClick}>
          <i className="fas fa-user" />
          <span>{user ? user.displayName || user.username : 'Guest'}</span>
        </div>
        <button className="btn-outline" onClick={user ? onSignOut : onAuthClick}>
          {user ? 'Sign Out' : 'Sign In'}
        </button>
      </div>
    </header>
  );
}
