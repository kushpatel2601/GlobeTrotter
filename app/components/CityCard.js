'use client';

// shows cost level with dollar signs
function getCostLevel(costIndex) {
  if (costIndex <= 0.5) return { label: '$', color: '#10b981' };
  if (costIndex <= 1.0) return { label: '$$', color: '#f59e0b' };
  if (costIndex <= 1.5) return { label: '$$$', color: '#f97316' };
  return { label: '$$$$', color: '#ef4444' };
}

export default function CityCard({ city, onClick, showAddBtn, onAdd }) {
  const cost = getCostLevel(city.costIndex);

  return (
    <div className="city-card" onClick={onClick}>
      <div className="city-card-image">
        <img
          src={city.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
          alt={city.name}
          loading="lazy"
        />
      </div>

      <div className="city-card-body">
        <h4 className="city-card-name">{city.name}</h4>
        <p className="city-card-country">{city.country} • {city.region}</p>

        <div className="city-card-meta">
          <span style={{ color: cost.color, fontWeight: 600 }}>{cost.label}</span>
          <span>🔥 {city.popularity}% popular</span>
        </div>

        {showAddBtn && (
          <button
            className="btn btn-primary btn-sm"
            style={{ width: '100%', marginTop: 12 }}
            onClick={(e) => {
              e.stopPropagation();
              onAdd && onAdd(city);
            }}
          >
            + Add to Trip
          </button>
        )}
      </div>
    </div>
  );
}
