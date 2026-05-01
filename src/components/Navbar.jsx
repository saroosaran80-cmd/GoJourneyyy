import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/buses', label: 'Buses', icon: '🚌' },
  { to: '/help', label: 'Help', icon: '🎧' },
  { to: '/contact', label: 'Contact', icon: '📞' },
];

function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('gj_user') || 'null');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <span className="logo-bus">🚌</span>
          <span className="logo-text">Go<span className="logo-accent">Journey</span></span>
        </Link>

        {/* Links — Desktop */}
        <div className="nav-links">
          {NAV_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link ${isActive(l.to) ? 'active' : ''}`}
            >
              {l.label}
              {isActive(l.to) && <span className="nav-link-dot"></span>}
            </Link>
          ))}
        </div>

        {/* Actions — Desktop */}
        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/profile" className="nav-profile-btn">
                <div className="nav-avatar">{user.name?.[0]?.toUpperCase() || '👤'}</div>
                <span>{user.name?.split(' ')[0]}</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn-ghost">Login</Link>
              <Link to="/signup" className="nav-btn-primary">Sign Up →</Link>
            </>
          )}
        </div>

        {/* Hamburger — Mobile */}
        <button
          className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`nav-mobile ${menuOpen ? 'open' : ''}`}>
        {NAV_LINKS.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`nm-link ${isActive(l.to) ? 'active' : ''}`}
          >
            <span>{l.icon}</span> {l.label}
          </Link>
        ))}
        <div className="nm-actions">
          {user ? (
            <Link to="/profile" className="nm-link active">👤 My Profile</Link>
          ) : (
            <>
              <Link to="/login" className="nm-login">Login</Link>
              <Link to="/signup" className="nm-signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
