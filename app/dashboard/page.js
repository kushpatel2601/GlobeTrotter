'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import TripCard from '../components/TripCard';
import CityCard from '../components/CityCard';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check auth and load initial dashboard data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch {
      router.push('/login');
      return;
    }

    // Fetch user's trips and recommended cities in parallel
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [tripsRes, citiesRes] = await Promise.all([
          fetch('/api/trips', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/cities?limit=6'),
        ]);

        if (tripsRes.ok) {
          const tripsData = await tripsRes.json();
          setTrips(tripsData.trips || []);
        }

        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();
          setPopularCities(citiesData.cities || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  const handleDeleteTrip = async (tripId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setTrips((prev) => prev.filter((t) => t.id !== tripId));
      } else {
        alert('Could not delete trip. Please try again.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (!user) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Filter trips into ongoing/upcoming (active) vs completed/past
  const activeTrips = trips.filter((t) => t.status !== 'completed');
  const pastTrips = trips.filter((t) => t.status === 'completed');

  // Quick stats calculation
  const totalDestinations = trips.reduce(
    (acc, t) => acc + (t.stops ? t.stops.length : 0),
    0
  );
  const totalBudget = trips.reduce((acc, t) => acc + (t.budget || 0), 0);

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {/* Welcome Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Welcome, {user.firstName}! ✈️</h1>
            <p>Here is an overview of your travel plans and popular destinations to explore.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/trips/new')}
            id="create-trip-top-btn"
          >
            + Create New Trip
          </button>
        </div>

        {/* Hero Banner (Matching Wireframe Screen 3) */}
        <div
          className="dashboard-banner"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(10, 10, 26, 0.85), rgba(17, 17, 40, 0.7)), url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="dashboard-banner-overlay">
            <span className="badge badge-ongoing" style={{ width: 'fit-content', marginBottom: 12 }}>
              🌍 Personalized Travel Planner
            </span>
            <h1>Dream. Plan. Experience.</h1>
            <p>
              Build multi-city itineraries, customize your daily activities, and stay comfortably within your budget.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => router.push('/trips/new')}
                id="banner-plan-btn"
              >
                🚀 Plan a New Journey
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => router.push('/explore')}
                id="banner-explore-btn"
              >
                🔍 Explore Places
              </button>
            </div>
          </div>
        </div>

        {/* Quick Highlights / Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 36,
          }}
        >
          <div className="stat-card animate-fade-in-up stagger-1">
            <div className="stat-icon">✈️</div>
            <div className="stat-value">{trips.length}</div>
            <div className="stat-label">Total Trips Created</div>
          </div>
          <div className="stat-card animate-fade-in-up stagger-2">
            <div className="stat-icon">🗓️</div>
            <div className="stat-value">{activeTrips.length}</div>
            <div className="stat-label">Active / Upcoming Plans</div>
          </div>
          <div className="stat-card animate-fade-in-up stagger-3">
            <div className="stat-icon">📍</div>
            <div className="stat-value">{totalDestinations}</div>
            <div className="stat-label">Cities / Stops Planned</div>
          </div>
          <div className="stat-card animate-fade-in-up stagger-4">
            <div className="stat-icon">💰</div>
            <div className="stat-value" style={{ color: 'var(--accent-secondary)' }}>
              ${totalBudget.toLocaleString()}
            </div>
            <div className="stat-label">Estimated Total Budget</div>
          </div>
        </div>

        {/* Active & Preferred Trips Section */}
        <section style={{ marginBottom: 40 }}>
          <div className="section-header">
            <div>
              <h2>🗓️ Planned & Upcoming Trips</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Your current active travel itineraries
              </p>
            </div>
            {trips.length > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => router.push('/trips')}
              >
                View All Trips →
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : activeTrips.length > 0 ? (
            <div className="grid-3">
              {activeTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onDelete={handleDeleteTrip}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '36px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎒</div>
              <h3>No active trips planned yet!</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 450, margin: '8px auto 20px' }}>
                You haven&apos;t created any upcoming itineraries yet. Start planning your dream destination in minutes.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => router.push('/trips/new')}
              >
                + Plan Your First Trip
              </button>
            </div>
          )}
        </section>

        {/* Previous / Completed Trips Section (Matching Wireframe Screen 3) */}
        {pastTrips.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <div className="section-header">
              <div>
                <h2>✨ Previous Trips & Memories</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Journeys you have already completed
                </p>
              </div>
            </div>

            <div className="grid-3">
              {pastTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onDelete={handleDeleteTrip}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recommended Destinations / Popular Cities */}
        <section style={{ marginBottom: 40 }}>
          <div className="section-header">
            <div>
              <h2>🌟 Top Recommended Destinations</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Popular travel hotspots with curated activities & budget estimates
              </p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push('/explore')}
            >
              Explore All Cities →
            </button>
          </div>

          <div className="grid-3">
            {popularCities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                onClick={() => router.push(`/explore?q=${encodeURIComponent(city.name)}`)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
