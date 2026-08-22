'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';

const VIBE_OPTIONS = [
  { id: 'scenic', title: '🏔️ Parks & Scenery', desc: 'Mountains, parks, lakes, and nature views' },
  { id: 'heritage', title: '🏛️ Historic & Culture', desc: 'Monuments, museums, old towns & art' },
  { id: 'beach', title: '🏖️ Coastal & Relax', desc: 'Beaches, sunsets, wellness & chill vibes' },
  { id: 'urban', title: '🌆 Urban & Nightlife', desc: 'Skyline views, shopping, cafes & bars' },
];

const STYLE_OPTIONS = [
  { id: 'relaxed', title: '🧘 Relaxed (1-2 acts/day)', budgetTier: 'Moderate Budget' },
  { id: 'balanced', title: '🚶 Balanced (3-4 acts/day)', budgetTier: 'Standard Budget' },
  { id: 'packed', title: '⚡ Action-Packed (5+ acts/day)', budgetTier: 'High Energy' },
];

export default function ItineraryBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tripId = params.id;
  const initialCityId = searchParams ? searchParams.get('initialCity') : null;

  const [trip, setTrip] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Active section data
  const [currentCityId, setCurrentCityId] = useState(initialCityId || '');
  const [selectedVibe, setSelectedVibe] = useState('scenic');
  const [selectedStyle, setSelectedStyle] = useState('balanced');
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);

  // Stop cost inputs
  const [transportCost, setTransportCost] = useState(60);
  const [accommodationCost, setAccommodationCost] = useState(250);
  const [mealBudgetPerDay, setMealBudgetPerDay] = useState(40);

  // Load trip details & available cities
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [tripRes, citiesRes] = await Promise.all([
          fetch(`/api/trips/${tripId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/cities?limit=50'),
        ]);

        if (tripRes.ok) {
          const tripData = await tripRes.json();
          setTrip(tripData.trip);
        }

        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();
          setCities(citiesData.cities || []);
          if (!currentCityId && citiesData.cities?.length > 0) {
            setCurrentCityId(citiesData.cities[0].id);
          }
        }
      } catch (err) {
        console.error('Builder load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tripId, router]);

  // Load activity templates whenever current city changes
  useEffect(() => {
    if (!currentCityId || cities.length === 0) return;

    const activeCity = cities.find((c) => c.id === currentCityId);
    if (!activeCity) return;

    const defaultActivities = [
      { id: 'act-1', name: `Explore Landmark in ${activeCity.name}`, category: 'sightseeing', estimatedCost: 25, estimatedDuration: 120, description: 'Iconic panoramic sight and architecture visit.' },
      { id: 'act-2', name: `Local Street Food & Cafe Crawl`, category: 'food', estimatedCost: 30, estimatedDuration: 90, description: 'Authentic culinary experience with regional delicacies.' },
      { id: 'act-3', name: `Guided Walking & Cultural Tour`, category: 'culture', estimatedCost: 20, estimatedDuration: 150, description: 'Discover rich local heritage and hidden gems.' },
      { id: 'act-4', name: `Sunset River / Rooftop Viewpoint`, category: 'adventure', estimatedCost: 15, estimatedDuration: 60, description: 'Breathtaking evening skyline views.' },
      { id: 'act-5', name: `Night Market & Social District`, category: 'nightlife', estimatedCost: 35, estimatedDuration: 120, description: 'Vibrant local evening atmosphere and entertainment.' },
    ];

    setAvailableTemplates(defaultActivities);
    setSelectedActivities(defaultActivities.slice(0, 3));
  }, [currentCityId, cities]);

  const toggleActivity = (act) => {
    if (selectedActivities.some((a) => a.id === act.id || a.name === act.name)) {
      setSelectedActivities(selectedActivities.filter((a) => a.id !== act.id && a.name !== act.name));
    } else {
      setSelectedActivities([...selectedActivities, act]);
    }
  };

  const handleSaveAndAddStop = async () => {
    if (!currentCityId) {
      setError('Please select a destination city for this stop.');
      return;
    }

    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      // 1. Create the Stop
      const stopPayload = {
        cityId: currentCityId,
        arrivalDate: trip?.startDate || new Date().toISOString(),
        departureDate: trip?.endDate || new Date().toISOString(),
        transportCost: parseFloat(transportCost) || 0,
        accommodationCost: parseFloat(accommodationCost) || 0,
        mealBudgetPerDay: parseFloat(mealBudgetPerDay) || 0,
      };

      const stopRes = await fetch(`/api/trips/${tripId}/stops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(stopPayload),
      });

      const stopData = await stopRes.json();
      if (!stopRes.ok) {
        throw new Error(stopData.error || 'Failed to save stop');
      }

      const createdStop = stopData.stop;

      // 2. Add selected activities to this Stop
      for (const act of selectedActivities) {
        await fetch(`/api/trips/${tripId}/stops/${createdStop.id}/activities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: act.name,
            category: act.category || 'sightseeing',
            cost: act.estimatedCost || 0,
            durationMinutes: act.estimatedDuration || 60,
          }),
        });
      }

      // Navigate to Screen 9 (Day-wise Itinerary & Budget View)
      router.push(`/trips/${tripId}`);
    } catch (err) {
      console.error('Save stop error:', err);
      setError(err.message || 'Failed to save itinerary stop.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const activeCityObj = cities.find((c) => c.id === currentCityId);
  const totalStopActivitiesCost = selectedActivities.reduce((acc, a) => acc + (a.estimatedCost || 0), 0);
  const estimatedStopTotal = (parseFloat(transportCost) || 0) + (parseFloat(accommodationCost) || 0) + totalStopActivitiesCost + ((parseFloat(mealBudgetPerDay) || 0) * 3);

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {/* Header matching Screen 5 Wireframe */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => router.push(`/trips/${tripId}`)}
              >
                ← Trip Overview
              </button>
              <span className="badge badge-ongoing">Screen 5 • Itinerary Builder</span>
            </div>
            <h1>Customize Itinerary: {trip?.name} 🧭</h1>
            <p>Answer a few quick preferences to automatically generate your day-wise schedule and budget breakdown.</p>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleSaveAndAddStop}
            disabled={saving}
            id="finish-builder-top-btn"
          >
            {saving ? 'Saving Plan...' : 'Save & View Day Plan →'}
          </button>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 24 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.3fr) minmax(280px, 0.7fr)', gap: 32, alignItems: 'start' }}>
          {/* Main Questionnaire Column (Screen 5 Sections) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Section 1: Stop Destination & Nature / Vibe */}
            <div className="questionnaire-step">
              <div className="questionnaire-step-header">
                <div className="step-number">1</div>
                <div>
                  <h3 style={{ fontSize: '1.125rem' }}>Select Stop Destination & Preferred Nature</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Tell us a bit about the nature of this place (Parks/Ridges, Heritage, Coastal)
                  </p>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">City for this Stop</label>
                <select
                  className="form-select"
                  value={currentCityId}
                  onChange={(e) => setCurrentCityId(e.target.value)}
                >
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      📍 {city.name}, {city.country} ({city.region})
                    </option>
                  ))}
                </select>
              </div>

              <div className="questionnaire-options">
                {VIBE_OPTIONS.map((vibe) => (
                  <div
                    key={vibe.id}
                    className={`questionnaire-option ${selectedVibe === vibe.id ? 'selected' : ''}`}
                    onClick={() => setSelectedVibe(vibe.id)}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 4 }}>{vibe.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{vibe.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Travel Style & Pace */}
            <div className="questionnaire-step">
              <div className="questionnaire-step-header">
                <div className="step-number">2</div>
                <div>
                  <h3 style={{ fontSize: '1.125rem' }}>Travel Pace & Daily Style</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    How packed would you like your daily schedule to be?
                  </p>
                </div>
              </div>

              <div className="questionnaire-options">
                {STYLE_OPTIONS.map((style) => (
                  <div
                    key={style.id}
                    className={`questionnaire-option ${selectedStyle === style.id ? 'selected' : ''}`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 4 }}>{style.title}</div>
                    <span className="badge badge-upcoming" style={{ fontSize: '0.6875rem' }}>
                      {style.budgetTier}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Select Activities for this Destination */}
            <div className="questionnaire-step">
              <div className="questionnaire-step-header">
                <div className="step-number">3</div>
                <div>
                  <h3 style={{ fontSize: '1.125rem' }}>Choose Experiences & Activities</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Select activities to include in your day-by-day itinerary in {activeCityObj?.name || 'this city'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {availableTemplates.map((act) => {
                  const isSelected = selectedActivities.some((a) => a.id === act.id || a.name === act.name);
                  return (
                    <div
                      key={act.id}
                      onClick={() => toggleActivity(act)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          style={{ width: 18, height: 18, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{act.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {act.description} • ⏱️ {act.estimatedDuration} mins
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.9375rem' }}>
                        ${act.estimatedCost}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Transit, Accommodation & Food Estimates */}
            <div className="questionnaire-step">
              <div className="questionnaire-step-header">
                <div className="step-number">4</div>
                <div>
                  <h3 style={{ fontSize: '1.125rem' }}>Estimated Stop Expenses (Budgeting)</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Fine-tune transit, stay, and meal estimates for this destination
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 12 }}>
                <div className="form-group">
                  <label className="form-label">🚆 Transit ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={transportCost}
                    onChange={(e) => setTransportCost(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">🏨 Stay / Hotel ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={accommodationCost}
                    onChange={(e) => setAccommodationCost(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">🍽️ Meals/Day ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={mealBudgetPerDay}
                    onChange={(e) => setMealBudgetPerDay(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action matching Wireframe */}
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={handleSaveAndAddStop}
                disabled={saving}
              >
                {saving ? 'Saving Plan...' : 'Save & View Day-by-Day Plan (Screen 9) →'}
              </button>
            </div>
          </div>

          {/* Right Sidebar: Real-Time Stop Summary & Cost Estimate */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 20 }}>
            {activeCityObj && (
              <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ height: 160, position: 'relative' }}>
                  <img
                    src={activeCityObj.imageUrl}
                    alt={activeCityObj.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: 10, left: 14, background: 'rgba(10, 10, 26, 0.8)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8125rem' }}>
                    📍 {activeCityObj.name}
                  </div>
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: 12 }}>Stop Financial Summary</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Selected Activities ({selectedActivities.length}):</span>
                      <strong style={{ color: 'var(--text-primary)' }}>${totalStopActivitiesCost}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Transport & Transit:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>${transportCost || 0}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Accommodation:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>${accommodationCost || 0}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Estimated Meals (3 Days):</span>
                      <strong style={{ color: 'var(--text-primary)' }}>${(parseFloat(mealBudgetPerDay) || 0) * 3}</strong>
                    </div>
                    <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
                      <span>Estimated Stop Total:</span>
                      <span style={{ color: 'var(--accent-primary)' }}>${estimatedStopTotal}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trip Goal Card */}
            <div className="glass-card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: 6 }}>🎯 Overall Trip Budget</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Target: <strong>${trip?.budget ? trip.budget.toLocaleString() : 'Not Set'}</strong>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
