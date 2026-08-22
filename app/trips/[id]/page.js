'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import BudgetChart from '../../components/BudgetChart';

function getCategoryBadge(cat) {
  const map = {
    sightseeing: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', icon: '🏛️' },
    food: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', icon: '🍽️' },
    adventure: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', icon: '🧗' },
    culture: { bg: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', icon: '🎭' },
    nightlife: { bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', icon: '🌙' },
  };
  return map[cat] || { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', icon: '📌' };
}

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id;

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'budget'
  const [copied, setCopied] = useState(false);

  const loadTrip = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTrip(data.trip);
      } else {
        router.push('/trips');
      }
    } catch (err) {
      console.error('Failed to load trip:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const handleShare = () => {
    if (!trip) return;
    const url = `${window.location.origin}/community?trip=${trip.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDeleteStop = async (stopId) => {
    if (!confirm('Are you sure you want to remove this destination stop?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/trips/${tripId}/stops/${stopId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadTrip();
      }
    } catch (err) {
      console.error('Error deleting stop:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!trip) return null;

  // Calculate detailed financial breakdown
  const stops = trip.stops || [];
  let totalActivitiesCost = 0;
  let totalTransportCost = 0;
  let totalAccommodationCost = 0;
  let totalMealCost = 0;

  stops.forEach((stop) => {
    totalTransportCost += stop.transportCost || 0;
    totalAccommodationCost += stop.accommodationCost || 0;
    totalMealCost += (stop.mealBudgetPerDay || 0) * 3;
    (stop.activities || []).forEach((act) => {
      totalActivitiesCost += act.cost || 0;
    });
  });

  const totalCalculatedCost = totalTransportCost + totalAccommodationCost + totalMealCost + totalActivitiesCost;
  const isOverBudget = trip.budget && totalCalculatedCost > trip.budget;
  const budgetPercentage = trip.budget ? Math.min(100, Math.round((totalCalculatedCost / trip.budget) * 100)) : 0;

  const totalDays = Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)));
  const avgCostPerDay = Math.round(totalCalculatedCost / totalDays);

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {/* Top Navigation & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => router.push('/trips')}
            style={{ fontSize: '0.9375rem' }}
          >
            ← Back to All Trips
          </button>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleShare}
              id="share-trip-btn"
            >
              {copied ? '✅ Link Copied!' : '🔗 Share Trip'}
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => router.push(`/trips/${trip.id}/builder`)}
              id="customize-builder-btn"
            >
              ➕ Add Destination Stop / Activity
            </button>
          </div>
        </div>

        {/* Hero Card for Trip */}
        <div
          className="dashboard-banner"
          style={{
            height: 220,
            marginBottom: 24,
            backgroundImage: `linear-gradient(135deg, rgba(10, 10, 26, 0.85), rgba(17, 17, 40, 0.6)), url("${trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200'}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="dashboard-banner-overlay" style={{ padding: 28 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-ongoing">{trip.status.toUpperCase()}</span>
              {trip.isPublic && <span className="badge badge-upcoming">PUBLIC ITINERARY</span>}
            </div>
            <h1>{trip.name}</h1>
            <p style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
              <span>📅 {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}</span>
              <span>⏱️ {totalDays} Days</span>
              <span>📍 {stops.length} {stops.length === 1 ? 'Destination Stop' : 'Destination Stops'}</span>
            </p>
          </div>
        </div>

        {/* View Switcher Tabs (Screen 9 Layout) */}
        <div className="filter-tabs" style={{ marginBottom: 28 }}>
          <button
            className={`filter-tab ${activeTab === 'itinerary' ? 'active' : ''}`}
            onClick={() => setActiveTab('itinerary')}
            id="tab-itinerary"
          >
            🗺️ Day-Wise Itinerary Plan
          </button>
          <button
            className={`filter-tab ${activeTab === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveTab('budget')}
            id="tab-budget"
          >
            💰 Budget & Financial Breakdown
          </button>
        </div>

        {/* Tab 1: Day-Wise Itinerary View (Screen 9 Layout) */}
        {activeTab === 'itinerary' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(280px, 0.6fr)', gap: 32, alignItems: 'start' }}>
            {/* Left: Day-by-Day Stops & Physical Activities */}
            <div>
              {stops.length === 0 ? (
                <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>🧭</div>
                  <h3>No itinerary stops added yet</h3>
                  <p style={{ color: 'var(--text-secondary)', margin: '8px auto 20px', maxWidth: 400 }}>
                    Use the questionnaire builder to configure your first destination stop and daily activities.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => router.push(`/trips/${trip.id}/builder`)}
                  >
                    + Build Your First Stop
                  </button>
                </div>
              ) : (
                stops.map((stop, sIdx) => (
                  <div key={stop.id} style={{ marginBottom: 36 }}>
                    {/* Destination City Banner */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(113, 75, 103, 0.2))',
                        border: '1px solid var(--border-accent)',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: 16,
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-primary)', fontWeight: 700 }}>
                          Stop {sIdx + 1}
                        </span>
                        <h2 style={{ fontSize: '1.375rem', marginTop: 2 }}>
                          📍 {stop.city?.name}, {stop.city?.country}
                        </h2>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          <div>Transit: <strong>${stop.transportCost}</strong></div>
                          <div>Stay: <strong>${stop.accommodationCost}</strong></div>
                        </div>
                        <button
                          onClick={() => handleDeleteStop(stop.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', fontSize: '1.1rem' }}
                          title="Remove Stop"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Day-Wise Activities List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 12, borderLeft: '2px solid var(--border-subtle)' }}>
                      {(stop.activities || []).length === 0 ? (
                        <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          No activities assigned for this stop yet.
                        </div>
                      ) : (
                        stop.activities.map((act, aIdx) => {
                          const badge = getCategoryBadge(act.category);
                          return (
                            <div
                              key={act.id}
                              className="activity-item"
                              style={{ marginLeft: 8 }}
                            >
                              <div
                                className="activity-category-icon"
                                style={{ background: badge.bg, color: badge.color }}
                              >
                                {badge.icon}
                              </div>

                              <div className="activity-info">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Activity {aIdx + 1}
                                  </span>
                                  <span className="badge" style={{ background: badge.bg, color: badge.color, fontSize: '0.625rem' }}>
                                    {act.category}
                                  </span>
                                </div>
                                <div className="activity-name">{act.name}</div>
                                <div className="activity-details">
                                  <span>⏱️ {act.durationMinutes} mins</span>
                                  {act.notes && <span>📝 {act.notes}</span>}
                                </div>
                              </div>

                              <div className="activity-cost">
                                ${act.cost}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right: Quick Financial & Highlights Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 20 }}>
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: 16 }}>📊 Expense Summary</h3>

                {/* Progress bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 6 }}>
                    <span>Budget Usage</span>
                    <strong>{budgetPercentage}%</strong>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'var(--bg-input)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${budgetPercentage}%`,
                        height: '100%',
                        background: isOverBudget ? 'var(--accent-danger)' : 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Transport & Flights:</span>
                    <strong>${totalTransportCost}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Accommodations:</span>
                    <strong>${totalAccommodationCost}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Daily Meals:</span>
                    <strong>${totalMealCost}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Activities & Tours:</span>
                    <strong>${totalActivitiesCost}</strong>
                  </div>
                  <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
                    <span>Total Estimated:</span>
                    <span style={{ color: isOverBudget ? 'var(--accent-danger)' : 'var(--accent-primary)' }}>
                      ${totalCalculatedCost.toLocaleString()}
                    </span>
                  </div>
                  {trip.budget && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <span>Target Budget:</span>
                      <span>${trip.budget.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {isOverBudget && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: 10, color: '#fca5a5', fontSize: '0.75rem', marginTop: 14 }}>
                    ⚠️ This trip is currently estimated at <strong>${(totalCalculatedCost - trip.budget).toLocaleString()}</strong> over your target budget.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full Budget Breakdown (Screen 9 Budget Section) */}
        {activeTab === 'budget' && (
          <div>
            <div className="budget-summary">
              <div className="budget-card">
                <div className="budget-card-label">Total Estimated Cost</div>
                <div className="budget-card-value" style={{ color: 'var(--accent-primary)' }}>
                  ${totalCalculatedCost.toLocaleString()}
                </div>
              </div>
              <div className="budget-card">
                <div className="budget-card-label">Target Budget</div>
                <div className="budget-card-value">
                  ${trip.budget ? trip.budget.toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="budget-card">
                <div className="budget-card-label">Average Cost / Day</div>
                <div className="budget-card-value" style={{ color: 'var(--accent-secondary)' }}>
                  ${avgCostPerDay} / day
                </div>
              </div>
              <div className="budget-card">
                <div className="budget-card-label">Stops Configured</div>
                <div className="budget-card-value">{stops.length} Cities</div>
              </div>
            </div>

            {/* Interactive SVG Category Donut & Expense Chart */}
            <div className="glass-card" style={{ padding: 28, marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem' }}>🥧 Visual Expense Breakdown</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Hover over chart slices to inspect category totals and budget utilization
                  </p>
                </div>
                <span className="badge badge-ongoing">Live Interactive</span>
              </div>

              <BudgetChart
                transportCost={totalTransportCost}
                accommodationCost={totalAccommodationCost}
                mealCost={totalMealCost}
                activitiesCost={totalActivitiesCost}
                targetBudget={trip.budget || 0}
              />
            </div>

            {/* Visual Budget Breakdown Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🚆</div>
                <h4 style={{ fontSize: '1rem', marginBottom: 2 }}>Transit & Travel</h4>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>${totalTransportCost}</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {totalCalculatedCost > 0 ? Math.round((totalTransportCost / totalCalculatedCost) * 100) : 0}% of total expenses
                </p>
              </div>

              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🏨</div>
                <h4 style={{ fontSize: '1rem', marginBottom: 2 }}>Accommodations</h4>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>${totalAccommodationCost}</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {totalCalculatedCost > 0 ? Math.round((totalAccommodationCost / totalCalculatedCost) * 100) : 0}% of total expenses
                </p>
              </div>

              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🍽️</div>
                <h4 style={{ fontSize: '1rem', marginBottom: 2 }}>Meals & Dining</h4>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>${totalMealCost}</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {totalCalculatedCost > 0 ? Math.round((totalMealCost / totalCalculatedCost) * 100) : 0}% of total expenses
                </p>
              </div>

              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🎟️</div>
                <h4 style={{ fontSize: '1rem', marginBottom: 2 }}>Activities & Tours</h4>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a78bfa' }}>${totalActivitiesCost}</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {totalCalculatedCost > 0 ? Math.round((totalActivitiesCost / totalCalculatedCost) * 100) : 0}% of total expenses
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
