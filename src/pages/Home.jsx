import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const POPULAR_ROUTES = [
  { from: 'Mumbai', to: 'Pune', price: '₹350', time: '3h 30m', icon: '🌆' },
  { from: 'Delhi', to: 'Jaipur', price: '₹450', time: '5h 0m', icon: '🏛️' },
  { from: 'Bangalore', to: 'Chennai', price: '₹600', time: '5h 30m', icon: '🌇' },
  { from: 'Hyderabad', to: 'Bangalore', price: '₹700', time: '7h 0m', icon: '🏙️' },
  { from: 'Chennai', to: 'Coimbatore', price: '₹400', time: '4h 30m', icon: '🌴' },
  { from: 'Kolkata', to: 'Bhubaneswar', price: '₹550', time: '6h 0m', icon: '🌊' },
];

const STATS = [
  { value: '5M+', label: 'Happy Passengers', icon: '😊' },
  { value: '1000+', label: 'Cities Covered', icon: '🗺️' },
  { value: '500+', label: 'Bus Operators', icon: '🚌' },
  { value: '99%', label: 'On-Time Rate', icon: '⏱️' },
];

const FEATURES = [
  { icon: '🚌', title: 'Huge Network', desc: 'Connect to 1000+ cities across India with top operators.' },
  { icon: '💰', title: 'Best Prices', desc: 'Price match guarantee. Find the cheapest fares every time.' },
  { icon: '🔒', title: '100% Secure', desc: '256-bit SSL encryption & PCI-DSS compliant payments.' },
  { icon: '⭐', title: '24/7 Support', desc: 'Round the clock live chat, phone & email support.' },
  { icon: '📱', title: 'Easy Booking', desc: 'Book in under 2 minutes with our streamlined flow.' },
  { icon: '🎟️', title: 'Instant E-Ticket', desc: 'Get your ticket on email instantly after booking.' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', city: 'Mumbai', rating: 5, text: 'Super easy booking process! Got my tickets in under a minute.', avatar: 'P' },
  { name: 'Rahul Verma', city: 'Delhi', rating: 5, text: 'Best prices I have found. Saved ₹300 compared to other websites.', avatar: 'R' },
  { name: 'Ananya Krishnan', city: 'Bangalore', rating: 4, text: 'Great experience. The seat selection feature is very intuitive!', avatar: 'A' },
];

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Pimpri', 'Patna', 'Vadodara',
];

function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ from: '', to: '', date: '', tripType: 'one-way', returnDate: '' });
  const [errors, setErrors] = useState({});
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const getSuggestions = (val) =>
    val.length < 1 ? [] : CITIES.filter(c => c.toLowerCase().startsWith(val.toLowerCase())).slice(0, 5);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.from) errs.from = 'Select departure city';
    if (!form.to) errs.to = 'Select destination city';
    if (!form.date) errs.date = 'Pick a date';
    if (form.from === form.to && form.from) errs.to = 'Destination must differ from origin';
    setErrors(errs);
    if (!Object.keys(errs).length) navigate('/buses', { state: form });
  };

  const swap = () => setForm(f => ({ ...f, from: f.to, to: f.from }));

  const fillRoute = (route) => {
    setForm(f => ({ ...f, from: route.from, to: route.to }));
    setErrors({});
  };

  return (
    <div className="home-page">

      {/* ── HERO ── */}
      <section className="home-hero">
        {/* Animated background particles */}
        <div className="hero-particles">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="particle" style={{ '--i': i }}></div>
          ))}
        </div>


        <div className="hero-inner">
          <div className="hero-badge">🚌 India's Best Bus Booking Platform</div>
          <h1 className="hero-title">
            Travel <span className="hero-grad">Smarter</span>,<br />
            Book <span className="hero-grad">Faster</span>
          </h1>
          <p className="hero-subtitle">
            Book bus tickets to 1000+ cities. Instant confirmation. Best prices guaranteed.
          </p>

          {/* Search Card */}
          <div className="search-card">
            {/* Trip toggle */}
            <div className="trip-toggle">
              {['one-way', 'round-trip'].map(t => (
                <button
                  key={t}
                  className={`tt-btn ${form.tripType === t ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, tripType: t }))}
                  type="button"
                >
                  {t === 'one-way' ? '→ One Way' : '⇄ Round Trip'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="search-row">
                {/* FROM */}
                <div className="search-field-wrap">
                  <div className={`search-field ${errors.from ? 'err' : ''}`}>
                    <span className="sf-icon">📍</span>
                    <div className="sf-content">
                      <label>From</label>
                      <input
                        type="text"
                        placeholder="Departure city"
                        value={form.from}
                        onChange={e => { setForm(f => ({ ...f, from: e.target.value })); setFromSuggestions(getSuggestions(e.target.value)); }}
                        onBlur={() => setTimeout(() => setFromSuggestions([]), 150)}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  {fromSuggestions.length > 0 && (
                    <ul className="suggestions">
                      {fromSuggestions.map(c => (
                        <li key={c} onMouseDown={() => { setForm(f => ({ ...f, from: c })); setFromSuggestions([]); }}>
                          📍 {c}
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.from && <span className="sf-err">{errors.from}</span>}
                </div>

                {/* SWAP */}
                <button type="button" className="swap-btn" onClick={swap} title="Swap cities">⇄</button>

                {/* TO */}
                <div className="search-field-wrap">
                  <div className={`search-field ${errors.to ? 'err' : ''}`}>
                    <span className="sf-icon">🏁</span>
                    <div className="sf-content">
                      <label>To</label>
                      <input
                        type="text"
                        placeholder="Destination city"
                        value={form.to}
                        onChange={e => { setForm(f => ({ ...f, to: e.target.value })); setToSuggestions(getSuggestions(e.target.value)); }}
                        onBlur={() => setTimeout(() => setToSuggestions([]), 150)}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  {toSuggestions.length > 0 && (
                    <ul className="suggestions">
                      {toSuggestions.map(c => (
                        <li key={c} onMouseDown={() => { setForm(f => ({ ...f, to: c })); setToSuggestions([]); }}>
                          🏁 {c}
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.to && <span className="sf-err">{errors.to}</span>}
                </div>

                {/* DATE */}
                <div className="search-field-wrap">
                  <div className={`search-field ${errors.date ? 'err' : ''}`}>
                    <span className="sf-icon">📅</span>
                    <div className="sf-content">
                      <label>Date</label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  {errors.date && <span className="sf-err">{errors.date}</span>}
                </div>

                {/* RETURN DATE */}
                {form.tripType === 'round-trip' && (
                  <div className="search-field-wrap">
                    <div className="search-field">
                      <span className="sf-icon">🔄</span>
                      <div className="sf-content">
                        <label>Return</label>
                        <input
                          type="date"
                          value={form.returnDate}
                          onChange={e => setForm(f => ({ ...f, returnDate: e.target.value }))}
                          min={form.date || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" className="search-btn">
                  🔍 Search Buses
                </button>
              </div>
            </form>
          </div>

          {/* Popular Routes */}
          <div className="popular-routes">
            <span className="pr-label">Popular:</span>
            {POPULAR_ROUTES.slice(0, 4).map((r, i) => (
              <button key={i} className="pr-chip" onClick={() => fillRoute(r)}>
                {r.icon} {r.from} → {r.to}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="home-stats">
        {STATS.map((s, i) => (
          <div key={i} className="stat-item">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── POPULAR ROUTES GRID ── */}
      <section className="home-section">
        <div className="section-header">
          <h2>Popular <span className="grad-text">Routes</span></h2>
          <p>Most booked routes this week</p>
        </div>
        <div className="routes-grid">
          {POPULAR_ROUTES.map((r, i) => (
            <div key={i} className="route-card" onClick={() => fillRoute(r)}>
              <div className="rc-icon">{r.icon}</div>
              <div className="rc-route">
                <span className="rc-from">{r.from}</span>
                <span className="rc-arrow">──→</span>
                <span className="rc-to">{r.to}</span>
              </div>
              <div className="rc-meta">
                <span className="rc-price">{r.price}</span>
                <span className="rc-time">⏱ {r.time}</span>
              </div>
              <button className="rc-btn">Book Now</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="home-section alt-bg">
        <div className="section-header">
          <h2>Why <span className="grad-text">GoJourney</span>?</h2>
          <p>Everything you need, all in one place</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="fc-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="home-section">
        <div className="section-header">
          <h2>What <span className="grad-text">Passengers</span> Say</h2>
          <p>Trusted by millions of travellers</p>
        </div>
        <div className="testimonials-wrap">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`testimonial-card ${activeTestimonial === i ? 'active' : ''}`}>
              <div className="tc-stars">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
              <p className="tc-text">"{t.text}"</p>
              <div className="tc-author">
                <div className="tc-avatar">{t.avatar}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.city}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="tc-dots">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} className={`tc-dot ${activeTestimonial === i ? 'active' : ''}`} onClick={() => setActiveTestimonial(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="home-cta">
        <div className="cta-inner">
          <div className="cta-icon">🚌</div>
          <h2>Ready to start your journey?</h2>
          <p>Book your next bus ticket in under 2 minutes</p>
          <button className="cta-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Book Now →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">GoJourney</span>
            <p>India's most trusted bus booking platform. Travel smart, travel safe.</p>
          </div>
          <div className="footer-links">
            <div className="fl-col">
              <strong>Company</strong>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
            </div>
            <div className="fl-col">
              <strong>Support</strong>
              <a href="/help">Help Center</a>
              <a href="/contact">Contact Us</a>
              <a href="#">Cancellation</a>
            </div>
            <div className="fl-col">
              <strong>Legal</strong>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
              <a href="#">Refund Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 GoJourney. All rights reserved.</span>
          <span>Made with ❤️ in India</span>
        </div>
      </footer>
    </div>
  );
}

export default Home;
