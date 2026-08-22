'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function CommunityPage() {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cloningId, setCloningId] = useState(null);
  const [clonedSuccessMsg, setClonedSuccessMsg] = useState('');

  // Load public community trips
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadCommunityTrips = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/community');
        if (res.ok) {
          const data = await res.json();
          setTrips(data.trips || []);
        }
      } catch (err) {
        console.error('Failed to load community trips:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCommunityTrips();
  }, [router]);

  // Clone a public trip into user's personal account
  const handleCloneTrip = async (tripId, tripName) => {
    const token = localStorage.getItem('token');
    try {
      setCloningId(tripId);
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sourceTripId: tripId }),
      });

      const data = await res.json();

      if (res.ok) {
        setClonedSuccessMsg(`🎉 Copied "${tripName}" to your trips!`);
        setTimeout(() => {
          setClonedSuccessMsg('');
          router.push('/trips');
        }, 1800);
      } else {
        alert(data.error || 'Failed to clone trip');
      }
    } catch (err) {
      console.error('Clone error:', err);
      alert('An error occurred while copying the trip.');
    } finally {
      setCloningId(null);
    }
  };

  // Filter public trips by query
  const filteredTrips = useMemo(() => {
    if (!searchQuery.trim()) return trips;
    const q = searchQuery.toLowerCase();
    return trips.filter((t) => {
      const matchName = t.name.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchAuthor = `${t.user?.firstName} ${t.user?.lastName}`.toLowerCase().includes(q);
      const matchCity = t.stops?.some((s) => s.city?.name.toLowerCase().includes(q));
      return matchName || matchDesc || matchAuthor || matchCity;
    });
  }, [trips, searchQuery]);

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {/* Header matching Screen 10 */}
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1>Community Trips & Itineraries 🌐</h1>
              <p>Explore public travel plans crafted by fellow adventurers. Find inspiration and copy any itinerary into your account!</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/trips/new')}
            >
              + Create Your Own Trip
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {clonedSuccessMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-success)', borderRadius: 'var(--radius-md)', padding: '14px 20px', color: 'var(--accent-success)', fontWeight: 600, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>✅</span> {clonedSuccessMsg}
          </div>
        )}

        {/* Search Bar */}
        <div className="glass-card" style={{ padding: '18px 24px', marginBottom: 28 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search community trips by destination, author, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: 46, fontSize: '0.9375rem', paddingLeft: 18 }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Community Trips Grid */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid-3">
            {filteredTrips.map((trip) => {
              const totalDays = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24));
              const cityRoute = trip.stops?.map((s) => s.city?.name).filter(Boolean).join(' → ');
              const totalActs = trip.stops?.reduce((acc, s) => acc + (s.activities ? s.activities.length : 0), 0) || 0;

              return (
                <div key={trip.id} className="trip-card" style={{ cursor: 'default' }}>
                  <div className="trip-card-image">
                    <img
                      src={trip.coverImage || trip.stops?.[0]?.city?.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
                      alt={trip.name}
                    />
                    <div className="trip-card-status">
                      <span className="badge badge-ongoing">🌍 Public Itinerary</span>
                    </div>
                  </div>

                  <div className="trip-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#000' }}>
                        {trip.user?.firstName?.[0] || 'U'}
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Shared by <strong>{trip.user?.firstName} {trip.user?.lastName}</strong>
                      </span>
                    </div>

                    <h3 className="trip-card-title" style={{ fontSize: '1.125rem', marginBottom: 6 }}>
                      {trip.name}
                    </h3>

                    {cityRoute && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--accent-primary)', marginBottom: 8, fontWeight: 600 }}>
                        📍 {cityRoute}
                      </p>
                    )}

                    <div className="trip-card-meta" style={{ marginBottom: 12 }}>
                      <span>📅 {new Date(trip.startDate).toLocaleDateString()}</span>
                      <span>⏱️ {totalDays} days</span>
                      <span>🎟️ {totalActs} activities</span>
                    </div>

                    {trip.description && (
                      <p className="trip-card-description" style={{ marginBottom: 16 }}>
                        {trip.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => router.push(`/trips/${trip.id}`)}
                      >
                        👁️ View
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1.4 }}
                        disabled={cloningId === trip.id}
                        onClick={() => handleCloneTrip(trip.id, trip.name)}
                      >
                        {cloningId === trip.id ? 'Copying...' : '📋 Copy to My Trips'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌐</div>
            <h3>No community trips found</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '8px auto 0' }}>
              Try searching with another keyword or publish your own itinerary to the community!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
