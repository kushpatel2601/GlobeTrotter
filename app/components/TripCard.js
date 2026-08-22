'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// simple helper to format dates nicely
function formatRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const opts = { month: 'short', day: 'numeric' };
  const startStr = s.toLocaleDateString('en-US', opts);
  const endStr = e.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${startStr} - ${endStr}`;
}

function getStatusBadge(status) {
  const map = {
    planning: { label: 'Planning', className: 'badge-planning' },
    ongoing: { label: 'Ongoing', className: 'badge-ongoing' },
    upcoming: { label: 'Upcoming', className: 'badge-upcoming' },
    completed: { label: 'Completed', className: 'badge-completed' },
  };
  return map[status] || map.planning;
}

export default function TripCard({ trip, onDelete }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const cityNames = trip.stops
    ? trip.stops.map(s => s.city?.name).filter(Boolean).join(' → ')
    : '';

  const totalDays = Math.ceil(
    (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)
  );

  const badge = getStatusBadge(trip.status);

  // fallback cover image if none set
  const coverImg = trip.coverImage
    || trip.stops?.[0]?.city?.imageUrl
    || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';

  return (
    <div className="trip-card" onClick={() => router.push(`/trips/${trip.id}`)}>
      <div className="trip-card-image">
        <img src={coverImg} alt={trip.name} loading="lazy" />
        <div className="trip-card-status">
          <span className={`badge ${badge.className}`}>{badge.label}</span>
        </div>
      </div>

      <div className="trip-card-body">
        <h3 className="trip-card-title">{trip.name}</h3>

        <div className="trip-card-meta">
          <span>📅 {formatRange(trip.startDate, trip.endDate)}</span>
          <span>⏱️ {totalDays} days</span>
          {trip.stops && <span>📍 {trip.stops.length} {trip.stops.length === 1 ? 'stop' : 'stops'}</span>}
        </div>

        {cityNames && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--accent-primary)', marginBottom: 8 }}>
            {cityNames}
          </p>
        )}

        {trip.description && (
          <p className="trip-card-description">{trip.description}</p>
        )}

        <div className="trip-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/trips/${trip.id}`);
            }}
          >
            👁️ View
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/trips/${trip.id}/builder`);
            }}
          >
            ✏️ Edit
          </button>
          {onDelete && (
            confirmDelete ? (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(trip.id);
                  }}
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmDelete(false);
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: 'auto', color: 'var(--accent-danger)' }}
                title="Delete Trip"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConfirmDelete(true);
                }}
              >
                🗑️
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
