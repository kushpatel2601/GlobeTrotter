'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/trips', icon: '✈️', label: 'My Trips' },
  { href: '/calendar', icon: '📅', label: 'Calendar' },
  { href: '/explore', icon: '🔍', label: 'Explore' },
  { href: '/community', icon: '🌐', label: 'Community' },
  { href: '/profile', icon: '👤', label: 'Profile' },
];

const adminItems = [
  { href: '/admin', icon: '📊', label: 'Admin Panel' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();

    // Listen for custom event to update user data without reload
    window.addEventListener('userUpdated', loadUser);
    return () => window.removeEventListener('userUpdated', loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const allNavItems = user?.role === 'admin' 
    ? [...navItems, ...adminItems] 
    : navItems;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
        <div
          className="sidebar-logo"
          onClick={() => router.push('/dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <h2>🌍 GlobeTrotter</h2>
          <span>Plan. Explore. Share.</span>
        </div>

        <ul className="nav-links">
          {allNavItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <div className="user-avatar" style={{ overflow: 'hidden' }}>
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>{user.firstName?.[0]}{user.lastName?.[0]}</>
                )}
              </div>
              <div className="user-details">
                <div className="user-name">{user.firstName} {user.lastName}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            id="logout-btn"
            style={{ width: '100%', marginTop: 8, justifyContent: 'flex-start' }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 99, backdropFilter: 'blur(4px)',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      <button
        className="btn btn-icon"
        id="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 101,
          display: 'none', background: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)', border: '1px solid var(--border-subtle)',
          fontSize: '1.25rem',
        }}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav" id="mobile-nav">
        {navItems.slice(0, 5).map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive(item.href) ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              router.push(item.href);
            }}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <style jsx>{`
        @media (max-width: 768px) {
          #mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
