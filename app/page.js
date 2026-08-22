'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingHomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const featuredDestinations = [
    {
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      tag: 'Romantic & Cultural',
      cost: '$$$',
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      region: 'Asia',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      tag: 'Futuristic & Food',
      cost: '$$$',
    },
    {
      name: 'Bali',
      country: 'Indonesia',
      region: 'Asia',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      tag: 'Tropical & Relaxed',
      cost: '$',
    },
    {
      name: 'Rome',
      country: 'Italy',
      region: 'Europe',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
      tag: 'Historic & Culinary',
      cost: '$$',
    },
    {
      name: 'Dubai',
      country: 'UAE',
      region: 'Middle East',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      tag: 'Luxury & Modern',
      cost: '$$$$',
    },
    {
      name: 'Barcelona',
      country: 'Spain',
      region: 'Europe',
      image: 'https://images.unsplash.com/photo-1583422409516-2895a77efed6?w=800',
      tag: 'Art & Beach',
      cost: '$$',
    },
  ];

  const features = [
    {
      icon: '🧠',
      title: 'Smart Itinerary Questionnaire',
      desc: 'Craft tailor-made journeys in 4 simple steps: customize your vibe, pacing style, activity preferences, and spending thresholds.',
    },
    {
      icon: '📊',
      title: 'Real-Time Budget Intelligence',
      desc: 'Interactive SVG Donut charts and dynamic progress bars ensure your transit, hotel, food, and tour expenses never overshoot your budget.',
    },
    {
      icon: '📅',
      title: 'Interactive Travel Calendar',
      desc: 'Visualize overlapping journey ribbons across a 7-column monthly grid with expandable day-wise destination drawers.',
    },
    {
      icon: '🌐',
      title: 'Community Feed & 1-Click Clone',
      desc: 'Explore published itineraries from fellow travelers and instantly copy complete multi-stop routes directly into your account.',
    },
    {
      icon: '🔍',
      title: 'City & Activity Explorer',
      desc: 'Browse through 20+ global cities and 50+ curated adventure, cultural, and culinary activities with direct "+ Add to Trip" actions.',
    },
    {
      icon: '🛡️',
      title: 'Admin Analytics Dashboard',
      desc: 'Enterprise platform metrics, destination popularity leaderboards, category breakdowns, and user role management.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Top Glassmorphic Navigation Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(20px)',
          background: 'rgba(10, 10, 26, 0.75)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '16px 32px',
        }}
      >
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <div
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--accent-primary), #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)' }}>
              🌍
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff 40%, var(--accent-primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              GlobeTrotter
            </span>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav">
            <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500, transition: 'color 0.2s' }}>
              Features
            </a>
            <a href="#destinations" style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500, transition: 'color 0.2s' }}>
              Destinations
            </a>
            <a href="#how-it-works" style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500, transition: 'color 0.2s' }}>
              How It Works
            </a>
          </nav>

          {/* Auth CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isLoggedIn ? (
              <button
                className="btn btn-primary"
                onClick={() => router.push('/dashboard')}
                style={{ padding: '10px 22px' }}
              >
                Go to Dashboard ({user?.firstName || 'Account'}) →
              </button>
            ) : (
              <>
                <button
                  className="btn btn-ghost"
                  onClick={() => router.push('/login')}
                  style={{ padding: '8px 16px', fontSize: '0.9375rem' }}
                >
                  Sign In
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => router.push('/register')}
                  style={{ padding: '10px 20px', fontSize: '0.9375rem' }}
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '90px 24px 70px', textAlign: 'center', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--accent-primary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: 24,
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)',
            }}
          >
            <span>🏆</span> Built for Odoo × LDCE Hackathon 2026
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: 20,
              letterSpacing: '-0.03em',
            }}
          >
            Design Multi-City Journeys with{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #fbbf24 40%, var(--accent-secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Intelligent Financial Clarity
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: 720,
              margin: '0 auto 36px',
            }}
          >
            GlobeTrotter transforms travel planning into a seamless, data-driven experience. Customize day-wise itineraries, track expenses with interactive charts, and discover curated global experiences.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 54 }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => router.push(isLoggedIn ? '/trips/new' : '/register')}
              style={{ padding: '16px 40px', fontSize: '1.0625rem', fontWeight: 700 }}
            >
              🚀 {isLoggedIn ? 'Create New Journey' : 'Start Planning for Free'}
            </button>
          </div>

          {/* Live Platform Preview Card */}
          <div
            className="glass-card"
            style={{
              padding: 24,
              maxWidth: 860,
              margin: '0 auto',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(245, 158, 11, 0.1)',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.25rem' }}>✈️</span>
                <div>
                  <h4 style={{ fontSize: '1rem', margin: 0 }}>Grand European Summer Discovery</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>14 Days • 4 Cities • Balanced Style</p>
                </div>
              </div>
              <span className="badge badge-ongoing">Live Active Route</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 Route Itinerary</div>
                <div style={{ fontWeight: 700, color: 'var(--accent-primary)', marginTop: 4, fontSize: '0.875rem' }}>
                  Paris → Barcelona → Rome
                </div>
              </div>

              <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>💰 Budget Allocation</div>
                <div style={{ fontWeight: 700, color: 'var(--accent-secondary)', marginTop: 4, fontSize: '0.875rem' }}>
                  $3,850 of $4,500 Target
                </div>
              </div>

              <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🎟️ Curated Activities</div>
                <div style={{ fontWeight: 700, color: '#f59e0b', marginTop: 4, fontSize: '0.875rem' }}>
                  12 Experiences Booked
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numerical Stats Strip */}
      <section style={{ borderY: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)', padding: '36px 24px', margin: '40px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-primary)' }}>20+</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>Global Destinations</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-secondary)' }}>50+</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>Curated Activity Templates</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-tertiary)' }}>100%</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>Responsive & Client-Side</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: '#ec4899' }}>$0</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>Free & Open Access</div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" style={{ padding: '70px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
          <span className="badge badge-ongoing" style={{ marginBottom: 12 }}>✨ Powerful Architecture</span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800 }}>Everything You Need for Perfect Journeys</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '10px auto 0', fontSize: '1rem' }}>
            Built with modern web technologies, normalized Prisma relations, and an intuitive dark glassmorphism user interface.
          </p>
        </div>

        <div className="grid-3" style={{ gap: 24 }}>
          {features.map((feat, idx) => (
            <div key={idx} className="glass-card" style={{ padding: 28 }}>
              <div style={{ fontSize: '2.25rem', marginBottom: 16 }}>{feat.icon}</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 10 }}>{feat.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Destinations Showcase */}
      <section id="destinations" style={{ padding: '70px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="badge badge-upcoming" style={{ marginBottom: 12 }}>🌏 Curated Catalogue</span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800 }}>Popular Destinations Worldwide</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.9375rem', maxWidth: 600, margin: '6px auto 0' }}>
            Explore handpicked cities with pre-calculated transit and accommodation cost indices.
          </p>
        </div>

        <div className="grid-3" style={{ gap: 24 }}>
          {featuredDestinations.map((dest, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{ overflow: 'hidden' }}
            >
              <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                <img
                  src={dest.image}
                  alt={dest.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    color: '#fbbf24',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {dest.cost}
                </span>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{dest.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>{dest.region}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>{dest.tag} • {dest.country}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works 3-Step Section */}
      <section id="how-it-works" style={{ padding: '70px 24px', background: 'rgba(255, 255, 255, 0.02)', borderY: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span className="badge badge-ongoing" style={{ marginBottom: 12 }}>⚡ Simple & Intuitive</span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', fontWeight: 800 }}>How GlobeTrotter Works</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '8px auto 0' }}>
              From initial dream to departure in three straightforward steps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
            <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: '#000', margin: '0 auto 20px' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Set Dates & Destination</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Pick your travel window, set your budget limit, and choose your primary arrival hub with instant duration calculation.
              </p>
            </div>

            <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-secondary), #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: '#000', margin: '0 auto 20px' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Personalize with Questionnaire</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Select your vibe, pacing style, and dream activities. GlobeTrotter automatically populates stops and calculates category costs.
              </p>
            </div>

            <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-tertiary), #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: '#000', margin: '0 auto 20px' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Track, Calendar & Share</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Review live budget donut charts, inspect your travel calendar, and publish to the community with one-click itinerary sharing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: '90px 24px', textAlign: 'center', position: 'relative' }}>
        <div
          className="glass-card"
          style={{
            maxWidth: 900,
            margin: '0 auto',
            padding: '54px 32px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, marginBottom: 16 }}>
            Ready to Plan Your Next Grand Adventure?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 32px', fontSize: '1.0625rem' }}>
            Join thousands of travelers building multi-city itineraries with complete financial peace of mind.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
            style={{ padding: '16px 40px', fontSize: '1.125rem', fontWeight: 700 }}
          >
            {isLoggedIn ? 'Enter Your Dashboard →' : 'Create Free Account Now 🌍'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '40px 32px',
          background: 'rgba(10, 10, 26, 0.95)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.25rem' }}>🌍</span>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem' }}>GlobeTrotter</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginLeft: 8 }}>
              © 2026 • Odoo × LDCE Hackathon Project
            </span>
          </div>

          <div style={{ display: 'flex', gap: 24, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <a href="/explore" style={{ color: 'var(--text-secondary)' }}>Explore Cities</a>
            <a href="/community" style={{ color: 'var(--text-secondary)' }}>Community Trips</a>
            <a href="/login" style={{ color: 'var(--text-secondary)' }}>Sign In</a>
            <a href="/register" style={{ color: 'var(--text-secondary)' }}>Register</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
