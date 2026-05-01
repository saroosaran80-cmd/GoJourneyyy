import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SeatSelection.css';

function SeatSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, searchData } = location.state || {};

  // if user arrives at the page without being logged in, send them to login
  useEffect(() => {
    const user = localStorage.getItem('gj_user');
    if (!user) {
      navigate('/login', {
        state: {
          from: {
            pathname: '/seats',
            state: { bus, searchData }
          }
        }
      });
    }
  }, [navigate, bus, searchData]);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [deck, setDeck] = useState('lower'); // lower | upper
  const [seatLayout, setSeatLayout] = useState({ lower: [], upper: [] });
  const [hoveredSeat, setHoveredSeat] = useState(null);

  useEffect(() => {
    const generate = (prefix, rows, ladiesRow = 1) => {
      return Array.from({ length: rows }, (_, i) => {
        const r = i + 1;
        return {
          row: r,
          left: [
            { number: `${prefix}${r}A`, available: Math.random() > 0.28, ladies: r === ladiesRow },
            { number: `${prefix}${r}B`, available: Math.random() > 0.28, ladies: r === ladiesRow },
          ],
          right: [
            { number: `${prefix}${r}C`, available: Math.random() > 0.28, ladies: false },
            { number: `${prefix}${r}D`, available: Math.random() > 0.28, ladies: false },
          ],
        };
      });
    };
    setSeatLayout({ lower: generate('L', 15, 1), upper: generate('U', 15, 2) });
  }, []);

  const findSeat = (num) => {
    for (const row of [...seatLayout.lower, ...seatLayout.upper]) {
      const s = [...row.left, ...row.right].find(s => s.number === num);
      if (s) return s;
    }
    return null;
  };

  const toggleSeat = (num) => {
    const user = localStorage.getItem('gj_user');
    if (!user) {
      alert('Please login to continue with seat selection.');
      // send the desired return location along with any needed state
      navigate('/login', {
        state: {
          from: {
            pathname: '/seats',
            state: { bus, searchData }
          }
        }
      });
      return;
    }

    const seat = findSeat(num);
    if (!seat || !seat.available) return;
    if (selectedSeats.includes(num)) {
      setSelectedSeats(selectedSeats.filter(s => s !== num));
    } else {
      if (selectedSeats.length >= 6) return;
      setSelectedSeats([...selectedSeats, num]);
    }
  };

  const handleContinue = () => {
    if (!selectedSeats.length) return;
    navigate('/passenger', {
      state: { bus, searchData, selectedSeats, totalAmount: selectedSeats.length * bus.price }
    });
  };

  const currentLayout = deck === 'lower' ? seatLayout.lower : seatLayout.upper;
  const total = selectedSeats.length * (bus?.price || 0);

  if (!bus) return (
    <div className="ss-error">
      <span>⚠️</span>
      <p>No bus selected. Please go back.</p>
      <button onClick={() => navigate('/buses')}>← Go Back</button>
    </div>
  );

  return (
    <div className="ss-page">
      {/* Header */}
      <div className="ss-header">
        <div className="ss-header-left">
          <button className="ss-back" onClick={() => navigate(-1)}>← Back</button>
          <div>
            <h1>Select Your Seats</h1>
            <p>{bus.operator} · {bus.busType} · {searchData.from} → {searchData.to} · {searchData.date}</p>
          </div>
        </div>
        <div className="ss-price-preview">
          <span className="ss-price-label">Total</span>
          <span className="ss-price-val">₹{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="ss-body">
        {/* Left: Bus Visual */}
        <div className="ss-left">
          {/* Deck Toggle */}
          {bus.busType.toLowerCase().includes('sleeper') && (
            <div className="ss-deck-toggle">
              <button className={deck === 'lower' ? 'active' : ''} onClick={() => setDeck('lower')}>🔽 Lower Deck</button>
              <button className={deck === 'upper' ? 'active' : ''} onClick={() => setDeck('upper')}>🔼 Upper Deck</button>
            </div>
          )}

          {/* Bus Shape */}
          <div className="ss-bus-wrap">
            <div className="ss-bus-front">
              <div className="ss-steering">🚌</div>
              <div className="ss-driver-label">Driver</div>
            </div>

            <div className="ss-bus-body">
              {currentLayout.map(row => (
                <div key={row.row} className="ss-row">
                  <div className="ss-row-num">{row.row}</div>
                  <div className="ss-seats-left">
                    {row.left.map(seat => (
                      <button
                        key={seat.number}
                        className={[
                          'ss-seat',
                          !seat.available ? 'occupied' : '',
                          selectedSeats.includes(seat.number) ? 'selected' : '',
                          seat.ladies ? 'ladies' : '',
                          hoveredSeat === seat.number ? 'hovered' : '',
                        ].join(' ')}
                        onClick={() => toggleSeat(seat.number)}
                        onMouseEnter={() => setHoveredSeat(seat.number)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        disabled={!seat.available}
                        title={seat.number}
                      >
                        <span className="seat-icon">💺</span>
                        <span className="seat-num">{seat.number.slice(-2)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="ss-aisle"></div>
                  <div className="ss-seats-right">
                    {row.right.map(seat => (
                      <button
                        key={seat.number}
                        className={[
                          'ss-seat',
                          !seat.available ? 'occupied' : '',
                          selectedSeats.includes(seat.number) ? 'selected' : '',
                          seat.ladies ? 'ladies' : '',
                        ].join(' ')}
                        onClick={() => toggleSeat(seat.number)}
                        onMouseEnter={() => setHoveredSeat(seat.number)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        disabled={!seat.available}
                        title={seat.number}
                      >
                        <span className="seat-icon">💺</span>
                        <span className="seat-num">{seat.number.slice(-2)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="ss-bus-rear">Rear</div>
          </div>

          {/* Legend */}
          <div className="ss-legend">
            {[
              ['available', '💺', 'Available'],
              ['selected', '💺', 'Selected'],
              ['occupied', '💺', 'Occupied'],
              ['ladies', '💺', 'Ladies Only'],
            ].map(([cls, icon, label]) => (
              <div key={cls} className="ss-legend-item">
                <div className={`ss-legend-seat ${cls}`}>{icon}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="ss-right">
          <div className="ss-summary-card">
            <h3>Booking Summary</h3>

            <div className="ss-journey-info">
              <div className="ss-ji-row">
                <span>🚌 Operator</span><strong>{bus.operator}</strong>
              </div>
              <div className="ss-ji-row">
                <span>🎫 Type</span><strong>{bus.busType}</strong>
              </div>
              <div className="ss-ji-row">
                <span>📅 Date</span><strong>{searchData.date}</strong>
              </div>
              <div className="ss-ji-row">
                <span>⏰ Departure</span><strong>{bus.departure}</strong>
              </div>
              <div className="ss-ji-row">
                <span>🏁 Arrival</span><strong>{bus.arrival}</strong>
              </div>
            </div>

            <div className="ss-selected-section">
              <h4>Selected Seats ({selectedSeats.length}/6)</h4>
              <div className="ss-seat-chips">
                {selectedSeats.length === 0
                  ? <span className="ss-no-seats">No seats selected</span>
                  : selectedSeats.map(s => (
                    <span key={s} className="ss-chip" onClick={() => toggleSeat(s)}>
                      {s} ✕
                    </span>
                  ))
                }
              </div>
            </div>

            <div className="ss-price-breakdown">
              <div className="ss-pb-row"><span>Price per seat</span><span>₹{bus.price?.toLocaleString()}</span></div>
              <div className="ss-pb-row"><span>Seats selected</span><span>{selectedSeats.length}</span></div>
              <div className="ss-pb-total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            </div>

            <div className="ss-limit-note">
              {selectedSeats.length === 6
                ? <p className="ss-limit-warn">⚠️ Maximum 6 seats reached</p>
                : <p>You can select up to <strong>{6 - selectedSeats.length}</strong> more seat{6 - selectedSeats.length !== 1 ? 's' : ''}</p>
              }
            </div>

            <div className="ss-actions">
              <button className="ss-btn-back" onClick={() => navigate(-1)}>← Back</button>
              <button
                className="ss-btn-continue"
                onClick={handleContinue}
                disabled={selectedSeats.length === 0}
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatSelection;
