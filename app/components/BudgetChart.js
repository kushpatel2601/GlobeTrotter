'use client';
import { useState } from 'react';

const CATEGORY_COLORS = {
  transport: { label: 'Transit & Travel', color: '#f59e0b', icon: '🚆' },
  accommodation: { label: 'Accommodations', color: '#14b8a6', icon: '🏨' },
  meals: { label: 'Meals & Dining', color: '#8b5cf6', icon: '🍽️' },
  activities: { label: 'Activities & Tours', color: '#ec4899', icon: '🎟️' },
};

export default function BudgetChart({
  transportCost = 0,
  accommodationCost = 0,
  mealCost = 0,
  activitiesCost = 0,
  targetBudget = 0,
}) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const data = [
    { key: 'transport', ...CATEGORY_COLORS.transport, value: transportCost },
    { key: 'accommodation', ...CATEGORY_COLORS.accommodation, value: accommodationCost },
    { key: 'meals', ...CATEGORY_COLORS.meals, value: mealCost },
    { key: 'activities', ...CATEGORY_COLORS.activities, value: activitiesCost },
  ].filter((item) => item.value > 0);

  const total = transportCost + accommodationCost + mealCost + activitiesCost;

  // Calculate SVG Donut Slices
  let cumulativeAngle = 0;
  const radius = 80;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;

  const slices = data.map((item) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativeAngle / 360) * circumference);
    cumulativeAngle += (percentage / 100) * 360;

    return {
      ...item,
      percentage: Math.round(percentage),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="budget-chart-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) minmax(280px, 1fr)', gap: 28, alignItems: 'center' }}>
      {/* SVG Donut Chart */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle track */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {slices.map((slice) => (
            <circle
              key={slice.key}
              cx="110"
              cy="110"
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={hoveredSlice === slice.key ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              strokeLinecap="butt"
              style={{
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                opacity: hoveredSlice && hoveredSlice !== slice.key ? 0.45 : 1,
              }}
              onMouseEnter={() => setHoveredSlice(slice.key)}
              onMouseLeave={() => setHoveredSlice(null)}
            />
          ))}
        </svg>

        {/* Center Label */}
        <div
          style={{
            position: 'absolute',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {hoveredSlice ? CATEGORY_COLORS[hoveredSlice]?.label : 'Total Cost'}
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
            ${hoveredSlice ? data.find((d) => d.key === hoveredSlice)?.value.toLocaleString() : total.toLocaleString()}
          </div>
          {targetBudget > 0 && !hoveredSlice && (
            <div style={{ fontSize: '0.6875rem', color: total > targetBudget ? 'var(--accent-danger)' : 'var(--accent-primary)', marginTop: 2 }}>
              {Math.round((total / targetBudget) * 100)}% of ${targetBudget.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Legend & Breakdown Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {data.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div
              key={item.key}
              onMouseEnter={() => setHoveredSlice(item.key)}
              onMouseLeave={() => setHoveredSlice(null)}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: hoveredSlice === item.key ? 'rgba(255, 255, 255, 0.08)' : 'var(--bg-card)',
                border: hoveredSlice === item.key ? `1px solid ${item.color}` : '1px solid var(--border-subtle)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.label}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: item.color, fontSize: '0.9375rem' }}>${item.value.toLocaleString()}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 6 }}>({pct}%)</span>
                </div>
              </div>

              {/* Progress track */}
              <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: item.color,
                    borderRadius: 3,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
