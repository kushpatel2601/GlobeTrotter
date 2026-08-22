'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <h1>🌍 GlobeTrotter</h1>
            <p>Your journey begins here</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} id="login-form">
            {error && <div className="auth-error" id="login-error">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                className="form-input"
                type="email"
                id="login-email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                className="form-input"
                type="password"
                id="login-password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              id="login-submit"
              disabled={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 8 }}>Demo Accounts:</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setFormData({ email: 'arjun@demo.com', password: 'user123' })}
                type="button"
              >
                👤 Demo User
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setFormData({ email: 'admin@globetrotter.com', password: 'admin123' })}
                type="button"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          <div className="auth-footer">
            Don&apos;t have an account?{' '}
            <a href="/register" id="register-link">Create one</a>
          </div>
        </div>
      </div>
    </div>
  );
}
