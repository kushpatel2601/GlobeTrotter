'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadAdminStats = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 403) {
          setError('You need admin access to view this page.');
          return;
        }

        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError('Failed to load admin data');
        }
      } catch (err) {
        console.error('Admin load error:', err);
        setError('Something went wrong loading stats');
      } finally {
        setLoading(false);
      }
    };

    loadAdminStats();
  }, [router]);

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

  if (error) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
            <h2>Access Denied</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{error}</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => router.push('/dashboard')}>
              ← Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  const stats = data?.stats || {};
  const users = data?.users || [];
  const popularCities = data?.popularCities || [];
  const categoryStats = data?.categoryStats || [];

  // color for category bars
  const catColors = {
    sightseeing: '#f59e0b',
    food: '#ec4899',
    adventure: '#14b8a6',
    culture: '#8b5cf6',
    nightlife: '#ef4444',
    transport: '#3b82f6',
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {/* Admin Header */}
        <div className="page-header">
          <h1>Admin Analytics Dashboard 📊</h1>
          <p>Monitor platform health, user activity, trip data, and destination insights across GlobeTrotter.</p>
        </div>

        {/* KPI Stats Row */}
        <div className="stats-row" style={{ marginBottom: 28 }}>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div>
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✈️</div>
            <div>
              <div className="stat-label">Trips Created</div>
              <div className="stat-value">{stats.totalTrips}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🌍</div>
            <div>
              <div className="stat-label">Cities Available</div>
              <div className="stat-value">{stats.totalCities}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎟️</div>
            <div>
              <div className="stat-label">Activities Logged</div>
              <div className="stat-value">{stats.totalActivities}</div>
            </div>
          </div>
        </div>

        {/* Second Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: '2rem' }}>🌐</div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Public Trips (Community)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{stats.publicTrips}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: '2rem' }}>💰</div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Average Trip Budget</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>${stats.avgBudget}</div>
            </div>
          </div>
        </div>

        {/* Main Analytics Grid: Popular Cities + Activity Categories */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 28 }}>
          {/* Popular Cities Ranking Table */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: 18 }}>🏆 Most Popular Destinations</h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rank</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>City</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Region</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Visits</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Popularity</th>
                  </tr>
                </thead>
                <tbody>
                  {popularCities.map((city, i) => (
                    <tr key={city.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 12px', fontSize: '0.875rem' }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{city.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{city.country}</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="badge badge-ongoing" style={{ fontSize: '0.6875rem' }}>{city.region}</span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {city._count?.stops || 0}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                          <div style={{ width: 60, height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${city.popularity}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{city.popularity}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Category Distribution */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: 18 }}>🎯 Activity Categories Breakdown</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {categoryStats.map((cat) => {
                const maxCount = Math.max(...categoryStats.map((c) => c._count.id), 1);
                const barWidth = (cat._count.id / maxCount) * 100;
                const color = catColors[cat.category] || '#94a3b8';

                return (
                  <div key={cat.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>
                        {cat.category}
                      </span>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color }}>{cat._count.id}</strong> activities
                        {cat._sum?.cost > 0 && (
                          <span> • ${Math.round(cat._sum.cost)} total</span>
                        )}
                      </div>
                    </div>
                    <div style={{ width: '100%', height: 8, background: 'var(--bg-input)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${barWidth}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}

              {categoryStats.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No activity data recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: '1.125rem' }}>👥 User Management</h3>
            <span className="badge badge-ongoing">{users.length} registered users</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</th>
                  <th style={{ textAlign: 'center', padding: '10px 14px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ textAlign: 'center', padding: '10px 14px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trips</th>
                  <th style={{ textAlign: 'center', padding: '10px 14px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: u.role === 'admin'
                            ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                            : 'linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#000',
                        }}>
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.firstName} {u.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span
                        className="badge"
                        style={{
                          background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                          color: u.role === 'admin' ? '#fca5a5' : '#fcd34d',
                          fontSize: '0.6875rem',
                        }}
                      >
                        {u.role === 'admin' ? '🛡️ Admin' : '🌍 User'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {u._count?.trips || 0}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
