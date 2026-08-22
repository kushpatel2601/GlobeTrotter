'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const userData = localStorage.getItem('user');
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch { router.push('/login'); }
    }
  }, [router]);

  if (!user) {
    return <div className="loading-spinner" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h1>Welcome back, {user.firstName}! 👋</h1>
          <p>Ready to plan your next adventure?</p>
        </div>

        {/* Banner */}
        <div className="dashboard-banner" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
          <div className="dashboard-banner-overlay" style={{ background: 'linear-gradient(135deg, rgba(10, 10, 26, 0.7) 0%, rgba(10, 10, 26, 0.3) 100%)' }}>
            <h1 style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Explore the World
            </h1>
            <p>Plan multi-city trips, discover activities, estimate budgets, and share your journey with the world.</p>
            <a href="/trips/new" className="btn btn-primary" id="plan-new-trip-btn">
              ✈️ Plan New Trip
            </a>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div className="stat-card animate-fade-in-up stagger-1">
            <div className="stat-value">✈️</div>
            <div className="stat-label">Plan New Trip</div>
          </div>
          <div className="stat-card animate-fade-in-up stagger-2">
            <div className="stat-value">🔍</div>
            <div className="stat-label">Explore Cities</div>
          </div>
          <div className="stat-card animate-fade-in-up stagger-3">
            <div className="stat-value">🌐</div>
            <div className="stat-label">Community Trips</div>
          </div>
          <div className="stat-card animate-fade-in-up stagger-4">
            <div className="stat-value">💰</div>
            <div className="stat-label">Budget Planner</div>
          </div>
        </div>

        <div className="empty-state">
          <div className="empty-state-icon">🗺️</div>
          <h3>More features coming soon!</h3>
          <p>Dashboard will show your upcoming trips, recommended cities, and budget highlights.</p>
        </div>
      </main>
    </div>
  );
}
