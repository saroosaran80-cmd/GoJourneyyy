import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BusListing.css';

const AMENITY_ICONS = {
  AC: '❄️', WiFi: '📶', Charging: '🔌', Blanket: '🛏️',
  Snacks: '🍿', Entertainment: '🎬', Water: '💧', GPS: '📍'
};

function BusListing() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchData = location.state || {};

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBus, setExpandedBus] = useState(null);
  const [filters, setFilters] = useState({
    sortBy: 'departure',
    ac: false, sleeper: false, seater: false,
    minPrice: 0, maxPrice: 5000,
    morningOnly: false, nightOnly: false,
  });

  useEffect(() => {
    setTimeout(() => {
      setBuses([
        { id: 1, operator: 'GoJourney Express', busType: 'AC Sleeper', departure: '10:00 AM', arrival: '06:00 PM', duration: '8h 0m', seatsAvailable: 25, totalSeats: 40, price: 1200, rating: 4.5, reviews: 312, amenities: ['AC', 'WiFi', 'Charging', 'Blanket'], badge: 'Most Popular' },
        { id: 2, operator: 'Luxury Travels', busType: 'Non-AC Seater', departure: '11:30 AM', arrival: '07:30 PM', duration: '8h 0m', seatsAvailable: 40, totalSeats: 50, price: 800, rating: 4.2, reviews: 180, amenities: ['WiFi', 'Charging'], badge: 'Best Value' },
        { id: 3, operator: 'Comfort Line', busType: 'AC Seater', departure: '09:00 PM', arrival: '05:00 AM', duration: '8h 0m', seatsAvailable: 12, totalSeats: 40, price: 1500, rating: 4.7, reviews: 540, amenities: ['AC', 'WiFi', 'Charging', 'Blanket', 'Snacks'], badge: 'Top Rated' },
        { id: 4, operator: 'Premium Bus Co.', busType: 'AC Sleeper', departure: '08:00 PM', arrival: '04:00 AM', duration: '8h 0m', seatsAvailable: 8, totalSeats: 32, price: 1800, rating: 4.8, reviews: 720, amenities: ['AC', 'WiFi', 'Charging', 'Blanket', 'Snacks', 'Entertainment'], badge: 'Premium' },
        { id: 5, operator: 'Budget Express', busType: 'Non-AC Sleeper', departure: '06:00 PM', arrival: '02:00 AM', duration: '8h 0m', seatsAvailable: 30, totalSeats: 45, price: 900, rating: 4.0, reviews: 95, amenities: ['Charging', 'Water'], badge: null },
        { id: 6, operator: 'Royal Cruiser', busType: 'AC Sleeper', departure: '11:00 PM', arrival: '07:00 AM', duration: '8h 0m', seatsAvailable: 5, totalSeats: 36, price: 2100, rating: 4.9, reviews: 880, amenities: ['AC', 'WiFi', 'Charging', 'Blanket', 'Snacks', 'Entertainment', 'GPS'], badge: 'Luxury' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const filtered = buses.filter(b => {
    if (filters.ac && !b.busType.includes('AC')) return false;
    if (filters.sleeper && !b.busType.includes('Sleeper')) return false;
    if (filters.seater && !b.busType.includes('Seater')) return false;
    if (b.price < filters.minPrice || b.price > filters.maxPrice) return false;
    if (filters.morningOnly && !b.departure.includes('AM')) return false;
    if (filters.nightOnly && !b.departure.includes('PM')) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'price') return a.price - b.price;
    if (filters.sortBy === 'rating') return b.rating - a.rating;
    if (filters.sortBy === 'seats') return b.seatsAvailable - a.seatsAvailable;
    return a.departure.localeCompare(b.departure);
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < Math.floor(rating) ? 'full' : i < rating ? 'half' : 'empty'}`}>★</span>
    ));
  };

  const clearFilters = () => setFilters({ sortBy: 'departure', ac: false, sleeper: false, seater: false, minPrice: 0, maxPrice: 5000, morningOnly: false, nightOnly: false });

  return (
    <div className="bl-page">
      {/* Header */}
      <div className="bl-header">
        <div className="bl-header-left">
          <button className="bl-back-btn" onClick={() => navigate('/')}>← Back</button>
          <div>
            <h1 className="bl-route">{searchData.from || 'Origin'} <span className="bl-arrow">→</span> {searchData.to || 'Destination'}</h1>
            <p className="bl-meta">{searchData.date} &nbsp;·&nbsp; {filtered.length} buses found</p>
          </div>
        </div>
        <div className="bl-sort-bar">
          {['departure', 'price', 'rating', 'seats'].map(s => (
            <button key={s} className={`bl-sort-btn ${filters.sortBy === s ? 'active' : ''}`} onClick={() => setFilters({ ...filters, sortBy: s })}>
              {s === 'departure' ? '🕐 Time' : s === 'price' ? '💰 Price' : s === 'rating' ? '⭐ Rating' : '💺 Seats'}
            </button>
          ))}
        </div>
      </div>

      <div className="bl-body">
        {/* Filters Sidebar */}
        <aside className="bl-sidebar">
          <div className="bl-filter-card">
            <div className="bl-filter-header">
              <h3>🔧 Filters</h3>
              <button className="bl-clear-btn" onClick={clearFilters}>Clear All</button>
            </div>

            <div className="bl-filter-section">
              <h4>Bus Type</h4>
              {[['ac', '❄️ AC'], ['sleeper', '🛏️ Sleeper'], ['seater', '💺 Seater']].map(([key, label]) => (
                <label key={key} className="bl-check-label">
                  <input type="checkbox" checked={filters[key]} onChange={e => setFilters({ ...filters, [key]: e.target.checked })} />
                  <span className="bl-custom-check"></span>
                  {label}
                </label>
              ))}
            </div>

            <div className="bl-filter-section">
              <h4>Departure Time</h4>
              <label className="bl-check-label">
                <input type="checkbox" checked={filters.morningOnly} onChange={e => setFilters({ ...filters, morningOnly: e.target.checked, nightOnly: false })} />
                <span className="bl-custom-check"></span>🌅 Morning (AM)
              </label>
              <label className="bl-check-label">
                <input type="checkbox" checked={filters.nightOnly} onChange={e => setFilters({ ...filters, nightOnly: e.target.checked, morningOnly: false })} />
                <span className="bl-custom-check"></span>🌙 Night (PM)
              </label>
            </div>

            <div className="bl-filter-section">
              <h4>Price Range</h4>
              <div className="bl-price-range">
                <input type="range" min="0" max="5000" step="100" value={filters.maxPrice}
                  onChange={e => setFilters({ ...filters, maxPrice: Number(e.target.value) })} />
                <div className="bl-price-labels">
                  <span>₹0</span><span>₹{filters.maxPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Bus Cards */}
        <div className="bl-list">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bl-skeleton">
                <div className="bl-skel-line wide"></div>
                <div className="bl-skel-line"></div>
                <div className="bl-skel-line short"></div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="bl-empty">
              <div className="bl-empty-icon">🚌</div>
              <h3>No buses found</h3>
              <p>Try adjusting your filters</p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            filtered.map(bus => {
              const seatPct = (bus.seatsAvailable / bus.totalSeats) * 100;
              const isLow = bus.seatsAvailable <= 10;
              const isExpanded = expandedBus === bus.id;

              return (
                <div key={bus.id} className={`bl-card ${isLow ? 'low-seats' : ''}`}>
                  {bus.badge && <div className="bl-badge">{bus.badge}</div>}

                  <div className="bl-card-main">
                    {/* Operator + Rating */}
                    <div className="bl-operator-col">
                      <div className="bl-bus-icon">🚌</div>
                      <div>
                        <h3 className="bl-operator">{bus.operator}</h3>
                        <span className="bl-bus-type">{bus.busType}</span>
                        <div className="bl-stars">
                          {renderStars(bus.rating)}
                          <span className="bl-rating-val">{bus.rating}</span>
                          <span className="bl-reviews">({bus.reviews})</span>
                        </div>
                      </div>
                    </div>

                    {/* Timing */}
                    <div className="bl-timing-col">
                      <div className="bl-time-wrap">
                        <div className="bl-time">{bus.departure}</div>
                        <div className="bl-city">{searchData.from}</div>
                      </div>
                      <div className="bl-duration-wrap">
                        <div className="bl-dur-label">{bus.duration}</div>
                        <div className="bl-dur-line"><div className="bl-dur-dot"></div></div>
                      </div>
                      <div className="bl-time-wrap right">
                        <div className="bl-time">{bus.arrival}</div>
                        <div className="bl-city">{searchData.to}</div>
                      </div>
                    </div>

                    {/* Seats + Price */}
                    <div className="bl-price-col">
                      <div className="bl-price">₹{bus.price.toLocaleString()}</div>
                      <div className="bl-per-seat">per seat</div>
                      <div className="bl-seat-bar-wrap">
                        <div className="bl-seat-bar">
                          <div className="bl-seat-fill" style={{ width: `${seatPct}%`, background: isLow ? '#ff4757' : '#00ffae' }}></div>
                        </div>
                        <span className={`bl-seats-left ${isLow ? 'low' : ''}`}>{bus.seatsAvailable} left</span>
                      </div>
                      <button
                        className="bl-select-btn"
                        onClick={() => {
                          const user = localStorage.getItem('gj_user');
                          if (!user) {
                            alert("Please login to select seats 🔒");
                            navigate('/login', { state: { from: '/seats', bus, searchData } });
                            return;
                          }
                          navigate('/seats', { state: { bus, searchData } });
                        }}
                      >
                        Select Seats →
                      </button>
                      <button className="bl-details-btn" onClick={() => setExpandedBus(isExpanded ? null : bus.id)}>
                        {isExpanded ? '▲ Less' : '▼ Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="bl-card-expanded">
                      <div className="bl-amenities-row">
                        <h4>Amenities</h4>
                        <div className="bl-amenities">
                          {bus.amenities.map((a, i) => (
                            <span key={i} className="bl-amenity">
                              {AMENITY_ICONS[a] || '✓'} {a}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="bl-policies">
                        <span>📋 Free cancellation up to 4hrs before</span>
                        <span>🪪 ID proof required on board</span>
                        <span>⏰ Board 10 mins before departure</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default BusListing;
