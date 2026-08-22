'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import CityCard from '../components/CityCard';

const REGIONS = ['All', 'Europe', 'Asia', 'Americas', 'Middle East', 'Africa'];
const CATEGORIES = ['all', 'sightseeing', 'food', 'adventure', 'culture', 'nightlife'];

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams ? searchParams.get('q') || '' : '';

  const [mode, setMode] = useState('cities'); // 'cities' | 'activities'
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add to Trip Modal State
  const [modalItem, setModalItem] = useState(null); // { type: 'city' | 'activity', data: obj }
  const [selectedTripId, setSelectedTripId] = useState('');
  const [addingToTrip, setAddingToTrip] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState('');

  // Fetch cities, activities, and user trips
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadAllExploreData = async () => {
      try {
        setLoading(true);
        const [citiesRes, activitiesRes, tripsRes] = await Promise.all([
          fetch('/api/cities?limit=50'),
          fetch('/api/activities?limit=60'),
          fetch('/api/trips', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();
          setCities(citiesData.cities || []);
        }

        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          setActivities(activitiesData.activities || []);
        }

        if (tripsRes.ok) {
          const tripsData = await tripsRes.json();
          setUserTrips(tripsData.trips || []);
          if (tripsData.trips?.length > 0) {
            setSelectedTripId(tripsData.trips[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load explore data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllExploreData();
  }, [router]);

  // Filter cities by search and region
  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      if (selectedRegion !== 'All' && city.region !== selectedRegion) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = city.name.toLowerCase().includes(q);
        const matchesCountry = city.country.toLowerCase().includes(q);
        const matchesDesc = city.description?.toLowerCase().includes(q);
        return matchesName || matchesCountry || matchesDesc;
      }
      return true;
    });
  }, [cities, selectedRegion, searchQuery]);

  // Filter activities by search, category, and region
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (selectedCategory !== 'all' && act.category !== selectedCategory) {
        return false;
      }
      if (selectedRegion !== 'All' && act.city?.region !== selectedRegion) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = act.name.toLowerCase().includes(q);
        const matchesDesc = act.description?.toLowerCase().includes(q);
        const matchesCity = act.city?.name.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesCity;
      }
      return true;
    });
  }, [activities, selectedCategory, selectedRegion, searchQuery]);

  // Handle "+ Add to Trip" submission
  const handleAddToTripSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTripId || !modalItem) return;

    setAddingToTrip(true);
    const token = localStorage.getItem('token');

    try {
      if (modalItem.type === 'city') {
        // Add city as a new stop
        const res = await fetch(`/api/trips/${selectedTripId}/stops`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cityId: modalItem.data.id,
            arrivalDate: new Date().toISOString(),
            departureDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            transportCost: 50,
            accommodationCost: 150,
            mealBudgetPerDay: 35,
          }),
        });

        if (!res.ok) throw new Error('Failed to add stop');
        setAddSuccessMsg(`✅ ${modalItem.data.name} added to your trip itinerary!`);
      } else if (modalItem.type === 'activity') {
        // Find existing stops for the trip, or create a stop for the activity's city
        const targetTrip = userTrips.find((t) => t.id === selectedTripId);
        let stopId = targetTrip?.stops?.[0]?.id;

        if (!stopId && modalItem.data.cityId) {
          const stopRes = await fetch(`/api/trips/${selectedTripId}/stops`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              cityId: modalItem.data.cityId,
              arrivalDate: new Date().toISOString(),
              departureDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              transportCost: 40,
              accommodationCost: 120,
              mealBudgetPerDay: 30,
            }),
          });
          const stopData = await stopRes.json();
          stopId = stopData.stop?.id;
        }

        if (stopId) {
          await fetch(`/api/trips/${selectedTripId}/stops/${stopId}/activities`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              templateId: modalItem.data.id,
              name: modalItem.data.name,
              category: modalItem.data.category,
              cost: modalItem.data.estimatedCost,
              durationMinutes: modalItem.data.estimatedDuration,
            }),
          });
          setAddSuccessMsg(`✅ "${modalItem.data.name}" added to your trip!`);
        }
      }

      setTimeout(() => {
        setModalItem(null);
        setAddSuccessMsg('');
        setAddingToTrip(false);
      }, 1500);
    } catch (err) {
      console.error('Error adding to trip:', err);
      alert('Failed to add to trip. Please try again.');
      setAddingToTrip(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {/* Header matching Screen 8 Wireframe */}
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1>Explore Places & Experiences 🔍</h1>
              <p>Discover global destinations, curated travel activities, and add them directly to your custom trips.</p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="filter-tabs" style={{ margin: 0 }}>
              <button
                className={`filter-tab ${mode === 'cities' ? 'active' : ''}`}
                onClick={() => setMode('cities')}
                id="tab-mode-cities"
              >
                🏙️ Destinations ({filteredCities.length})
              </button>
              <button
                className={`filter-tab ${mode === 'activities' ? 'active' : ''}`}
                onClick={() => setMode('activities')}
                id="tab-mode-activities"
              >
                🎟️ Activities ({filteredActivities.length})
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar matching Screen 8 Layout */}
        <div className="glass-card" style={{ padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search cities, landmarks, culinary tours, museums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: 48, fontSize: '1rem', paddingLeft: 18 }}
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
                  fontSize: '1rem',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Region Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Region:
            </span>
            {REGIONS.map((region) => (
              <button
                key={region}
                className={`btn btn-sm ${selectedRegion === region ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedRegion(region)}
                style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Category Filters (Active when in activities mode) */}
          {mode === 'activities' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Category:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setSelectedCategory(cat)}
                  style={{ textTransform: 'capitalize', padding: '6px 12px', fontSize: '0.8125rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Results Grid */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : mode === 'cities' ? (
          /* CITIES GRID */
          filteredCities.length > 0 ? (
            <div className="grid-3">
              {filteredCities.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  showAddBtn={userTrips.length > 0}
                  onAdd={(c) => setModalItem({ type: 'city', data: c })}
                  onClick={() => setSearchQuery(city.name)}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌏</div>
              <h3>No destination cities found</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '8px auto 0' }}>
                Try adjusting your search query or switching regions.
              </p>
            </div>
          )
        ) : (
          /* ACTIVITIES GRID (Screen 8 Layout) */
          filteredActivities.length > 0 ? (
            <div className="grid-3">
              {filteredActivities.map((act) => (
                <div key={act.id} className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <span className="badge badge-ongoing" style={{ textTransform: 'capitalize' }}>
                        {act.category}
                      </span>
                      <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        ${act.estimatedCost}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.125rem', marginBottom: 6 }}>{act.name}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--accent-secondary)', marginBottom: 8 }}>
                      📍 {act.city?.name}, {act.city?.country}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                      {act.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                      ⏱️ Duration: <strong>{act.estimatedDuration} minutes</strong>
                    </div>

                    {userTrips.length > 0 ? (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => setModalItem({ type: 'activity', data: act })}
                      >
                        + Add to My Trip
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => router.push('/trips/new')}
                      >
                        Plan a Trip First →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎟️</div>
              <h3>No activities found</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '8px auto 0' }}>
                Try selecting &apos;All&apos; categories or searching for another keyword.
              </p>
            </div>
          )
        )}

        {/* "+ Add to Trip" Modal */}
        {modalItem && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
              padding: 20,
            }}
            onClick={() => !addingToTrip && setModalItem(null)}
          >
            <div
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: 480,
                padding: 32,
                background: '#16162e',
                border: '1px solid var(--border-accent)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.25rem' }}>
                  {modalItem.type === 'city' ? `Add ${modalItem.data.name} to Trip` : `Add Activity to Trip`}
                </h3>
                <button
                  onClick={() => setModalItem(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {addSuccessMsg ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--accent-success)', fontWeight: 600 }}>
                  {addSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleAddToTripSubmit}>
                  <div style={{ padding: 14, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: '0.875rem' }}>
                    <strong>Selected {modalItem.type === 'city' ? 'Destination' : 'Activity'}:</strong>
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 600, marginTop: 4 }}>
                      {modalItem.data.name}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label">Choose Target Itinerary / Trip</label>
                    <select
                      className="form-select"
                      value={selectedTripId}
                      onChange={(e) => setSelectedTripId(e.target.value)}
                      required
                    >
                      {userTrips.map((trip) => (
                        <option key={trip.id} value={trip.id}>
                          ✈️ {trip.name} ({new Date(trip.startDate).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ flex: 1 }}
                      onClick={() => setModalItem(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      disabled={addingToTrip || !selectedTripId}
                    >
                      {addingToTrip ? 'Adding...' : 'Confirm & Add →'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
