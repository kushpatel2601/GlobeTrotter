'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import TripCard from '../components/TripCard';

export default function MyTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'ongoing' | 'upcoming' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all user trips on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadTrips = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/trips', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setTrips(data.trips || []);
        }
      } catch (err) {
        console.error('Failed to load trips:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
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
        alert('Failed to delete trip.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Filter trips by active tab and search query
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      // 1. Status Filter
      if (activeFilter !== 'all' && trip.status !== activeFilter) {
        return false;
      }

      // 2. Search Query (matches name, description, or any stop city name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = trip.name.toLowerCase().includes(q);
        const matchesDesc = trip.description?.toLowerCase().includes(q);
        const matchesCity = trip.stops?.some((s) =>
          s.city?.name.toLowerCase().includes(q)
        );
        return matchesName || matchesDesc || matchesCity;
      }

      return true;
    });
  }, [trips, activeFilter, searchQuery]);

  // Counts for each tab
  const counts = {
    all: trips.length,
    ongoing: trips.filter((t) => t.status === 'ongoing').length,
    upcoming: trips.filter((t) => t.status === 'upcoming' || t.status === 'planning').length,
    completed: trips.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {/* Header (Screen 6 Layout) */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>My Trips 🎒</h1>
            <p>Manage and explore all your planned, ongoing, and past travel itineraries in one place.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/trips/new')}
            id="plan-new-trip-btn"
          >
            + Plan New Trip
          </button>
        </div>

        {/* Filter Tabs & Search Bar Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          {/* Status Filter Tabs (Matching Screen 6 Wireframe) */}
          <div className="filter-tabs" style={{ margin: 0 }}>
            <button
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
              id="filter-all"
            >
              All ({counts.all})
            </button>
            <button
              className={`filter-tab ${activeFilter === 'ongoing' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ongoing')}
              id="filter-ongoing"
            >
              Ongoing ({counts.ongoing})
            </button>
            <button
              className={`filter-tab ${activeFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveFilter('upcoming')}
              id="filter-upcoming"
            >
              Upcoming ({counts.upcoming})
            </button>
            <button
              className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveFilter('completed')}
              id="filter-completed"
            >
              Completed ({counts.completed})
            </button>
          </div>

          {/* Search Input */}
          <div style={{ minWidth: 260, position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search by trip or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 16, height: 42 }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 12,
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

        {/* Trips Grid */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid-3">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={handleDeleteTrip}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🗺️</div>
            <h3>No trips found</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 460, margin: '8px auto 24px' }}>
              {searchQuery
                ? `No trips matched your search "${searchQuery}". Try searching for another city or name.`
                : activeFilter !== 'all'
                ? `You have no ${activeFilter} trips at the moment.`
                : 'You haven’t created any travel itineraries yet. Start your journey now!'}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/trips/new')}
            >
              + Create a New Trip
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
