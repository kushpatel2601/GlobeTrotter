'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeSection, setActiveSection] = useState('personal'); // personal | security | preferences

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    country: '',
    avatar: '',
    language: 'en',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setFormData({
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            phone: data.user.phone || '',
            city: data.user.city || '',
            country: data.user.country || '',
            avatar: data.user.avatar || '',
            language: data.user.language || 'en',
            newPassword: '',
            confirmPassword: '',
          });
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // basic validation for password
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const token = localStorage.getItem('token');
    setSaving(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        city: formData.city,
        country: formData.country,
        avatar: formData.avatar,
        language: formData.language,
      };

      // only send password if user typed something
      if (formData.newPassword && formData.newPassword.length >= 6) {
        payload.newPassword = formData.newPassword;
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);

        // also update localStorage so navbar picks up new name and avatar
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...stored,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          avatar: data.user.avatar,
        }));
        window.dispatchEvent(new Event('userUpdated'));

        setSuccessMsg('Profile saved successfully! ✅');
        setFormData((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <div className="loading-spinner"><div className="spinner"></div></div>
        </main>
      </div>
    );
  }

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <h1>My Profile & Settings 👤</h1>
          <p>Manage your account, update personal information, and configure travel preferences.</p>
        </div>

        {/* Success notification */}
        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-success)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 20px',
            color: 'var(--accent-success)',
            fontWeight: 600,
            marginBottom: 20,
          }}>
            {successMsg}
          </div>
        )}

        {/* Profile Card Header */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#000',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Profile Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>{profile?.firstName?.[0]}{profile?.lastName?.[0]}</>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>{profile?.firstName} {profile?.lastName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 6 }}>
              {profile?.email}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span className="badge badge-ongoing">{profile?.role === 'admin' ? '🛡️ Admin' : '🌍 Traveler'}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>📅 Member since {memberSince}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>✈️ {profile?._count?.trips || 0} trips planned</span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="filter-tabs" style={{ marginBottom: 24 }}>
          <button
            className={`filter-tab ${activeSection === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveSection('personal')}
          >
            👤 Personal Info
          </button>
          <button
            className={`filter-tab ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => setActiveSection('security')}
          >
            🔒 Security
          </button>
          <button
            className={`filter-tab ${activeSection === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveSection('preferences')}
          >
            ⚙️ Preferences
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* Personal Info Section */}
          {activeSection === 'personal' && (
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: 20 }}>Personal Information</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Upload Profile Photo</label>
                  <input
                    type="file"
                    className="form-input"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ paddingTop: 10 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ahmedabad"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="India"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: 20 }}>Change Password</h3>

              <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Email (Read Only)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={profile?.email || ''}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={formData.newPassword}
                    onChange={(e) => handleChange('newPassword', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Re-enter your new password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  />
                </div>

                {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p style={{ color: 'var(--accent-danger)', fontSize: '0.8125rem' }}>⚠️ Passwords do not match</p>
                )}
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: 20 }}>Travel Preferences</h3>

              <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Preferred Language</label>
                  <select
                    className="form-select"
                    value={formData.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                  >
                    <option value="en">🇬🇧 English</option>
                    <option value="hi">🇮🇳 Hindi</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="fr">🇫🇷 French</option>
                    <option value="de">🇩🇪 German</option>
                    <option value="ja">🇯🇵 Japanese</option>
                  </select>
                </div>

                <div style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  💡 More settings like notification preferences, default currency, and theme options are coming soon in a future update!
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ minWidth: 160 }}
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
