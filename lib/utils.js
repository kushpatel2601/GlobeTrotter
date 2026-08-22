function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
  const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
  if (sMonth === eMonth) {
    return `${sMonth} ${s.getDate()} - ${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
}

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
}

function getCategoryEmoji(category) {
  const emojis = {
    sightseeing: '🏛️',
    food: '🍽️',
    adventure: '🧗',
    culture: '🎭',
    nightlife: '🌙',
    shopping: '🛍️',
  };
  return emojis[category] || '📌';
}

function getCategoryColor(category) {
  const colors = {
    sightseeing: '#3b82f6',
    food: '#f59e0b',
    adventure: '#10b981',
    culture: '#8b5cf6',
    nightlife: '#ec4899',
    shopping: '#06b6d4',
  };
  return colors[category] || '#6b7280';
}

function getTripStatus(startDate, endDate) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'ongoing';
}

module.exports = {
  formatDate,
  formatDateRange,
  daysBetween,
  formatCurrency,
  generateSlug,
  getCategoryEmoji,
  getCategoryColor,
  getTripStatus,
};
