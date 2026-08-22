'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
    phone: '', city: '', country: '', avatar: '', additionalInfo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
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
      <div className="auth-container" style={{ maxWidth: 540 }}>
        <div className="auth-card">
          <div className="auth-logo">
            <h1>🌍 GlobeTrotter</h1>
            <p>Create your account and start exploring</p>
          </div>

          {/* Photo Preview Circle */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', position: 'relative', overflow: 'hidden',
              border: '3px solid var(--border-medium)',
            }}>
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                '📷'
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>Avatar Preview</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} id="register-form">
            {error && <div className="auth-error" id="register-error">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-firstName">First Name</label>
                <input
                  className="form-input" type="text" id="reg-firstName" name="firstName"
                  placeholder="John" value={formData.firstName} onChange={handleChange} required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-lastName">Last Name</label>
                <input
                  className="form-input" type="text" id="reg-lastName" name="lastName"
                  placeholder="Doe" value={formData.lastName} onChange={handleChange} required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email Address</label>
                <input
                  className="form-input" type="email" id="reg-email" name="email"
                  placeholder="you@example.com" value={formData.email} onChange={handleChange} required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">Phone Number</label>
                <input
                  className="form-input" type="tel" id="reg-phone" name="phone"
                  placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-city">City</label>
                <input
                  className="form-input" type="text" id="reg-city" name="city"
                  placeholder="Ahmedabad" value={formData.city} onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-country">Country</label>
                <input
                  className="form-input" type="text" id="reg-country" name="country"
                  placeholder="India" value={formData.country} onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                className="form-input" type="password" id="reg-password" name="password"
                placeholder="At least 6 characters" value={formData.password}
                onChange={handleChange} required minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-avatar">Upload Profile Photo (Optional)</label>
              <input
                className="form-input" type="file" id="reg-avatar" name="avatar"
                accept="image/*" onChange={handleFileChange}
                style={{ paddingTop: 10 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-additionalInfo">Additional Information</label>
              <textarea
                className="form-textarea" id="reg-additionalInfo" name="additionalInfo"
                placeholder="Tell us about yourself and your travel interests..."
                value={formData.additionalInfo} onChange={handleChange}
                rows={3}
              />
            </div>

            <button
              type="submit" className="btn btn-primary btn-lg" id="register-submit"
              disabled={loading} style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                  Creating account...
                </span>
              ) : 'Register & Start Planning'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <a href="/login" id="login-link">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
