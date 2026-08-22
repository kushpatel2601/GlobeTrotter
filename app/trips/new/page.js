'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

export default function CreateTripPage() {
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCities, setFetchingCities] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    selectedCityId: '',
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
    planningMode: 'manual', // 'auto' | 'manual' matching wireframe toggle
  });

  // Selected city object for preview
  const [selectedCity, setSelectedCity] = useState(null);

  // Check auth and load available cities
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadCities = async () => {
      try {
        const res = await fetch('/api/cities?limit=50');
        if (res.ok) {
          const data = await res.json();
          setCities(data.cities || []);
        }
      } catch (err) {
        console.error('Failed to load cities:', err);
      } finally {
        setFetchingCities(false);
      }
    };

    loadCities();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');

    if (name === 'selectedCityId') {
      const city = cities.find((c) => c.id === value);
      setSelectedCity(city || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic date validation
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date cannot be earlier than start date');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        coverImage: selectedCity ? selectedCity.imageUrl : null,
      };

      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create trip');
        setLoading(false);
        return;
      }

      const createdTrip = data.trip;

      // If user selected "Assign me the Places" or selected a primary city,
      // redirect to the questionnaire builder (Screen 5) with pre-filled city!
      if (formData.selectedCityId) {
        router.push(`/trips/${createdTrip.id}/builder?initialCity=${formData.selectedCityId}&mode=${formData.planningMode}`);
      } else {
        router.push(`/trips/${createdTrip.id}/builder?mode=${formData.planningMode}`);
      }
    } catch (err) {
      console.error('Trip create error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Quick helper to calculate trip duration
  const getDurationText = () => {
    if (!formData.startDate || !formData.endDate) return null;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Invalid dates';
    if (diffDays === 0) return '1 Day Trip';
    return `${diffDays} Days / ${diffDays - 1} Nights`;
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.back()}
              style={{ fontSize: '1.2rem', padding: '6px 12px' }}
            >
              ←
            </button>
            <div>
              <h1>Plan a New Trip 🗺️</h1>
              <p>Set your destination, travel window, and budgeting preferences to begin crafting your itinerary.</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(280px, 0.8fr)', gap: 32, alignItems: 'start' }}>
          {/* Create Trip Form (Screen 4 Layout) */}
          <div className="glass-card" style={{ padding: 32 }}>
            <form onSubmit={handleSubmit} className="auth-form" id="create-trip-form">
              {error && <div className="auth-error">{error}</div>}

              {/* Trip Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="trip-name">Trip Name *</label>
                <input
                  className="form-input"
                  type="text"
                  id="trip-name"
                  name="name"
                  placeholder="e.g. Summer in Southern Italy, Tokyo Solo Adventure"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Primary Destination / City Dropdown */}
              <div className="form-group">
                <label className="form-label" htmlFor="select-city">Select Primary Destination *</label>
                <select
                  className="form-select"
                  id="select-city"
                  name="selectedCityId"
                  value={formData.selectedCityId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Choose a starting city --</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.country} ({city.region})
                    </option>
                  ))}
                </select>
                {fetchingCities && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Loading popular cities...</span>
                )}
              </div>

              {/* Travel Dates */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="start-date">Start Date *</label>
                  <input
                    className="form-input"
                    type="date"
                    id="start-date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="end-date">End Date *</label>
                  <input
                    className="form-input"
                    type="date"
                    id="end-date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {getDurationText() && (
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--accent-primary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  ⏱️ <strong>Estimated Duration:</strong> {getDurationText()}
                </div>
              )}

              {/* Total Budget */}
              <div className="form-group">
                <label className="form-label" htmlFor="trip-budget">Estimated Total Budget (USD $)</label>
                <input
                  className="form-input"
                  type="number"
                  id="trip-budget"
                  name="budget"
                  placeholder="e.g. 2500"
                  min="0"
                  step="50"
                  value={formData.budget}
                  onChange={handleChange}
                />
              </div>

              {/* Planning Mode Preference (Matching Wireframe Screen 4) */}
              <div className="form-group">
                <label className="form-label">Itinerary Planning Style</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div
                    onClick={() => setFormData((prev) => ({ ...prev, planningMode: 'auto' }))}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: formData.planningMode === 'auto' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: formData.planningMode === 'auto' ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-input)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.25rem', marginBottom: 4 }}>✨</div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: formData.planningMode === 'auto' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      Auto-Curate Places
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Smart recommendations
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData((prev) => ({ ...prev, planningMode: 'manual' }))}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: formData.planningMode === 'manual' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: formData.planningMode === 'manual' ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-input)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.25rem', marginBottom: 4 }}>✍️</div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: formData.planningMode === 'manual' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      I&apos;ll Choose on My Own
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Manual customization
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="trip-desc">Trip Notes & Goals</label>
                <textarea
                  className="form-textarea"
                  id="trip-desc"
                  name="description"
                  placeholder="What are your main travel goals, places to try, or must-see landmarks?"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                id="create-trip-submit"
                disabled={loading}
                style={{ width: '100%', marginTop: 8 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                    Creating Trip...
                  </span>
                ) : (
                  'Continue to Itinerary Builder →'
                )}
              </button>
            </form>
          </div>

          {/* Right Side: Destination Preview & Travel Tips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {selectedCity ? (
              <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ height: 200, position: 'relative' }}>
                  <img
                    src={selectedCity.imageUrl}
                    alt={selectedCity.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: 12, left: 16, background: 'rgba(10, 10, 26, 0.75)', padding: '4px 12px', borderRadius: 'var(--radius-full)', backdropFilter: 'blur(8px)', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    📍 {selectedCity.name}, {selectedCity.country}
                  </div>
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>About {selectedCity.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                    {selectedCity.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Popularity: </span>
                      <strong style={{ color: 'var(--accent-primary)' }}>{selectedCity.popularity}%</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Region: </span>
                      <strong>{selectedCity.region}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌏</div>
                <h3 style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Select a Starting Destination
                </h3>
                <p style={{ fontSize: '0.875rem', maxWidth: 300, margin: '0 auto' }}>
                  Choose a city from the dropdown to see destination previews, average costs, and curated activity highlights.
                </p>
              </div>
            )}

            {/* Hackathon Tips Card */}
            <div className="glass-card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                💡 Travel Planning Tip
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                You can easily add multiple city stops, rearrange transit routes, and assign custom daily activities in the next step!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
