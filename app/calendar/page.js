'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Current calendar view date
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // Default to Sep 2026 matching sample trips
  const [selectedDay, setSelectedDay] = useState(null); // { year, month, date }
  const [selectedTripFilter, setSelectedTripFilter] = useState('all');

  // Load user trips
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
        console.error('Failed to load trips for calendar:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, [router]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar calculations
  const calendarData = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        month: month - 1,
        year,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: d,
        month,
        year,
        isCurrentMonth: true,
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: i,
        month: month + 1,
        year,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Check which trips overlap with a given date
  const getTripsForDate = (cellYear, cellMonth, cellDate) => {
    const cellTime = new Date(cellYear, cellMonth, cellDate).setHours(0, 0, 0, 0);

    return trips.filter((trip) => {
      if (selectedTripFilter !== 'all' && trip.id !== selectedTripFilter) return false;
      const start = new Date(trip.startDate).setHours(0, 0, 0, 0);
      const end = new Date(trip.endDate).setHours(23, 59, 59, 999);
      return cellTime >= start && cellTime <= end;
    });
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 1));
    setSelectedDay(null);
  };

  // Trips on currently selected day
  const selectedDayTrips = selectedDay
    ? getTripsForDate(selectedDay.year, selectedDay.month, selectedDay.date)
    : [];

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {/* Header matching Screen 11 */}
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1>Interactive Travel Calendar 📅</h1>
              <p>Visualize your planned journeys across the year, inspect daily itineraries, and manage scheduling windows.</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/trips/new')}
            >
              + Plan New Journey
            </button>
          </div>
        </div>

        {/* Controls Bar: Navigation & Trip Filter */}
        <div className="glass-card" style={{ padding: '16px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={handlePrevMonth} id="btn-prev-month">
              ◀ Prev
            </button>
            <h2 style={{ fontSize: '1.25rem', minWidth: 180, textAlign: 'center' }}>
              {MONTH_NAMES[month]} {year}
            </h2>
            <button className="btn btn-secondary btn-sm" onClick={handleNextMonth} id="btn-next-month">
              Next ▶
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleToday}>
              Reset to 2026
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Filter Trip:</span>
            <select
              className="form-select"
              style={{ width: 220, padding: '8px 12px' }}
              value={selectedTripFilter}
              onChange={(e) => setSelectedTripFilter(e.target.value)}
            >
              <option value="all">All Trips ({trips.length})</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  ✈️ {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 7-Column Calendar Grid (Screen 11 Layout) */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 28, overflowX: 'auto' }}>
          {/* Day Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(110px, 1fr))', gap: 8, marginBottom: 10, textAlign: 'center' }}>
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', padding: '6px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Cells Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(110px, 1fr))', gap: 8 }}>
            {calendarData.map((cell, idx) => {
              const activeTripsOnDay = getTripsForDate(cell.year, cell.month, cell.date);
              const isSelected = selectedDay && selectedDay.date === cell.date && selectedDay.month === cell.month && selectedDay.year === cell.year;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(cell)}
                  style={{
                    minHeight: 90,
                    padding: 8,
                    borderRadius: 'var(--radius-md)',
                    background: isSelected
                      ? 'rgba(245, 158, 11, 0.15)'
                      : cell.isCurrentMonth
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(255, 255, 255, 0.01)',
                    border: isSelected
                      ? '2px solid var(--accent-primary)'
                      : activeTripsOnDay.length > 0
                      ? '1px solid rgba(245, 158, 11, 0.3)'
                      : '1px solid var(--border-subtle)',
                    opacity: cell.isCurrentMonth ? 1 : 0.4,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: cell.isCurrentMonth ? 700 : 400, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      {cell.date}
                    </span>
                    {activeTripsOnDay.length > 0 && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />
                    )}
                  </div>

                  {/* Trip Events / Ribbons in Cell */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                    {activeTripsOnDay.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        style={{
                          fontSize: '0.6875rem',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(113, 75, 103, 0.35))',
                          color: '#fef3c7',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 600,
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                        }}
                      >
                        ✈️ {t.name}
                      </div>
                    ))}
                    {activeTripsOnDay.length > 2 && (
                      <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                        +{activeTripsOnDay.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Drawer / Card (Matching Screen 11 Layout) */}
        {selectedDay && (
          <div className="glass-card animate-fade-in-up" style={{ padding: 24, border: '1px solid var(--border-accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span className="badge badge-ongoing">Date Schedule</span>
                <h3 style={{ fontSize: '1.25rem', marginTop: 4 }}>
                  🗓️ {MONTH_NAMES[selectedDay.month]} {selectedDay.date}, {selectedDay.year}
                </h3>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedDay(null)}
              >
                ✕ Close
              </button>
            </div>

            {selectedDayTrips.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {selectedDayTrips.map((t) => {
                  const cityRoute = t.stops?.map((s) => s.city?.name).filter(Boolean).join(' → ');
                  return (
                    <div
                      key={t.id}
                      style={{
                        padding: 16,
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '1.0625rem', color: 'var(--accent-primary)' }}>{t.name}</h4>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          📍 Route: <strong>{cityRoute || 'Multi-city'}</strong> • 📅 {new Date(t.startDate).toLocaleDateString()} — {new Date(t.endDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => router.push(`/trips/${t.id}`)}
                        >
                          View Itinerary →
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => router.push(`/trips/${t.id}/builder`)}
                        >
                          Customize
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No travel itineraries scheduled on this date. Click &quot;+ Plan New Journey&quot; to schedule a trip!
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
