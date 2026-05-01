import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PassengerDetails.css';

function PassengerDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, searchData, selectedSeats, totalAmount } = location.state || {};

  const [passengers, setPassengers] = useState([]);
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    if (selectedSeats?.length) {
      setPassengers(selectedSeats.map(seat => ({ seatNumber: seat, name: '', age: '', gender: 'male' })));
    }
  }, [selectedSeats]);

  const updatePassenger = (i, field, value) => {
    setPassengers(p => { const u = [...p]; u[i] = { ...u[i], [field]: value }; return u; });
    setErrors(e => ({ ...e, [`p_${i}_${field}`]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!contact.name.trim()) errs.c_name = 'Name is required';
    if (!contact.email.includes('@')) errs.c_email = 'Valid email required';
    if (!contact.phone.trim() || contact.phone.length < 10) errs.c_phone = 'Valid phone required';
    passengers.forEach((p, i) => {
      if (!p.name.trim()) errs[`p_${i}_name`] = 'Name required';
      if (!p.age || p.age < 1 || p.age > 120) errs[`p_${i}_age`] = 'Valid age required';
    });
    return errs;
  };

  const handleContinue = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    navigate('/payment', { state: { bus, searchData, selectedSeats, totalAmount, passengers, contactInfo: contact } });
  };

  if (!bus || !selectedSeats) return (
    <div className="pd-error">
      <span>⚠️</span>
      <p>No booking data found. Please start over.</p>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );

  const filled = passengers.filter(p => p.name && p.age).length;
  const progress = Math.round(((filled / passengers.length) + (contact.name && contact.email && contact.phone ? 1 : 0)) / 2 * 100);

  return (
    <div className="pd-page">
      {/* Header */}
      <div className="pd-header">
        <div className="pd-header-left">
          <button className="pd-back" onClick={() => navigate(-1)}>← Back</button>
          <div>
            <h1>Passenger Details</h1>
            <p>{bus.operator} · {searchData.from} → {searchData.to} · {searchData.date}</p>
          </div>
        </div>
        <div className="pd-header-right">
          <div className="pd-progress-wrap">
            <span className="pd-progress-label">Form {progress}% complete</span>
            <div className="pd-progress-bar">
              <div className="pd-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div className="pd-price">₹{totalAmount?.toLocaleString()}</div>
        </div>
      </div>

      <div className="pd-body">
        <div className="pd-left">

          {/* ── Contact Information ── */}
          <div className="pd-card">
            <div className="pd-card-title">
              <span className="pd-card-icon">📋</span>
              <h2>Contact Information</h2>
              <span className="pd-card-sub">Booking confirmation will be sent here</span>
            </div>

            <div className="pd-form-grid">
              <div className="pd-field">
                <label>Full Name *</label>
                <div className={`pd-input-wrap ${errors.c_name ? 'err' : ''}`}>
                  <span>👤</span>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={contact.name}
                    onChange={e => { setContact(c => ({ ...c, name: e.target.value })); setErrors(er => ({ ...er, c_name: '' })); }}
                  />
                </div>
                {errors.c_name && <span className="pd-err">{errors.c_name}</span>}
              </div>

              <div className="pd-field">
                <label>Email Address *</label>
                <div className={`pd-input-wrap ${errors.c_email ? 'err' : ''}`}>
                  <span>📧</span>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={contact.email}
                    onChange={e => { setContact(c => ({ ...c, email: e.target.value })); setErrors(er => ({ ...er, c_email: '' })); }}
                  />
                </div>
                {errors.c_email && <span className="pd-err">{errors.c_email}</span>}
              </div>

              <div className="pd-field">
                <label>Phone Number *</label>
                <div className={`pd-input-wrap ${errors.c_phone ? 'err' : ''}`}>
                  <span>📱</span>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={contact.phone}
                    onChange={e => { setContact(c => ({ ...c, phone: e.target.value })); setErrors(er => ({ ...er, c_phone: '' })); }}
                  />
                </div>
                {errors.c_phone && <span className="pd-err">{errors.c_phone}</span>}
              </div>
            </div>
          </div>

          {/* ── Passenger Cards ── */}
          <div className="pd-card">
            <div className="pd-card-title">
              <span className="pd-card-icon">🧑‍🤝‍🧑</span>
              <h2>Passenger Details</h2>
              <span className="pd-card-sub">{passengers.length} passenger{passengers.length > 1 ? 's' : ''}</span>
            </div>

            {/* Passenger Tab Switcher */}
            {passengers.length > 1 && (
              <div className="pd-pax-tabs">
                {passengers.map((p, i) => (
                  <button
                    key={i}
                    className={`pd-pax-tab ${activeCard === i ? 'active' : ''} ${p.name && p.age ? 'done' : ''}`}
                    onClick={() => setActiveCard(i)}
                  >
                    {p.name && p.age ? '✓' : i + 1} · Seat {p.seatNumber}
                  </button>
                ))}
              </div>
            )}

            {passengers.map((passenger, i) => (
              <div
                key={i}
                className={`pd-pax-card ${passengers.length > 1 && activeCard !== i ? 'hidden' : ''}`}
              >
                <div className="pd-pax-header">
                  <div className="pd-pax-avatar">{passenger.name?.[0]?.toUpperCase() || (i + 1)}</div>
                  <div>
                    <strong>Passenger {i + 1}</strong>
                    <span className="pd-seat-badge">Seat {passenger.seatNumber}</span>
                  </div>
                </div>

                <div className="pd-form-grid">
                  <div className="pd-field full">
                    <label>Full Name *</label>
                    <div className={`pd-input-wrap ${errors[`p_${i}_name`] ? 'err' : ''}`}>
                      <span>👤</span>
                      <input
                        type="text"
                        placeholder="Passenger full name"
                        value={passenger.name}
                        onChange={e => updatePassenger(i, 'name', e.target.value)}
                      />
                    </div>
                    {errors[`p_${i}_name`] && <span className="pd-err">{errors[`p_${i}_name`]}</span>}
                  </div>

                  <div className="pd-field">
                    <label>Age *</label>
                    <div className={`pd-input-wrap ${errors[`p_${i}_age`] ? 'err' : ''}`}>
                      <span>🎂</span>
                      <input
                        type="number"
                        placeholder="Age"
                        value={passenger.age}
                        onChange={e => updatePassenger(i, 'age', e.target.value)}
                        min="1" max="120"
                      />
                    </div>
                    {errors[`p_${i}_age`] && <span className="pd-err">{errors[`p_${i}_age`]}</span>}
                  </div>

                  <div className="pd-field">
                    <label>Gender *</label>
                    <div className="pd-gender-group">
                      {[['male', '👨 Male'], ['female', '👩 Female'], ['other', '🧑 Other']].map(([val, label]) => (
                        <button
                          key={val}
                          type="button"
                          className={`pd-gender-btn ${passenger.gender === val ? 'active' : ''}`}
                          onClick={() => updatePassenger(i, 'gender', val)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Multi-passenger Next button */}
                {passengers.length > 1 && activeCard === i && i < passengers.length - 1 && (
                  <button
                    type="button"
                    className="pd-next-pax"
                    onClick={() => setActiveCard(i + 1)}
                  >
                    Next Passenger →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Summary ── */}
        <div className="pd-right">
          <div className="pd-summary-card">
            <h3>Journey Summary</h3>

            <div className="pd-summary-route">
              <div className="psr-city">{searchData.from}</div>
              <div className="psr-arrow">─── ✈ ───</div>
              <div className="psr-city">{searchData.to}</div>
            </div>

            <div className="pd-summary-rows">
              <div className="psr-row"><span>Date</span><strong>{searchData.date}</strong></div>
              <div className="psr-row"><span>Bus</span><strong>{bus.operator}</strong></div>
              <div className="psr-row"><span>Type</span><strong>{bus.busType}</strong></div>
              <div className="psr-row"><span>Departure</span><strong>{bus.departure}</strong></div>
              <div className="psr-row"><span>Seats</span><strong>{selectedSeats.join(', ')}</strong></div>
            </div>

            {/* Passenger mini-list */}
            <div className="pd-mini-pax">
              <h4>Passengers</h4>
              {passengers.map((p, i) => (
                <div key={i} className="pd-mini-row">
                  <div className="pd-mini-avatar">{p.name?.[0]?.toUpperCase() || '?'}</div>
                  <span>{p.name || `Passenger ${i + 1}`}</span>
                  <span className="pd-mini-seat">{p.seatNumber}</span>
                </div>
              ))}
            </div>

            <div className="pd-total-row">
              <span>Total Amount</span>
              <span className="pd-total-val">₹{totalAmount?.toLocaleString()}</span>
            </div>

            <div className="pd-actions">
              <button className="pd-btn-back" onClick={() => navigate(-1)}>← Back</button>
              <button className="pd-btn-continue" onClick={handleContinue}>
                Continue to Payment →
              </button>
            </div>

            <p className="pd-secure-note">🔒 Your data is encrypted & secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PassengerDetails;
