import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './BookingConfirmation.css';

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    bus, searchData, selectedSeats, totalAmount,
    passengers, contactInfo, paymentMethod,
    serviceFee = 0, taxes = 0, discountAmount = 0, grandTotal,
    bookingId, userEmail
  } = location.state || {};

  const displayBookingId = bookingId || `GJ${Date.now()}`;
  const finalTotal = grandTotal || totalAmount;

  const paymentLabels = {
    card: '💳 Credit / Debit Card',
    upi: '📱 UPI',
    netbanking: '🏦 Net Banking',
    wallet: '👛 Wallet',
  };

  const [emailBanner, setEmailBanner] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setEmailBanner(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  if (!bus || !selectedSeats) {
    return (
      <div className="conf-error">
        <div className="conf-error-icon">⚠️</div>
        <h2>No booking found</h2>
        <p>Please start a new booking from the home page.</p>
        <Link to="/" className="conf-home-btn">Go to Home</Link>
      </div>
    );
  }

  return (
    <div className="conf-page">
      {/* Email Sent Notification Banner */}
      {emailBanner && (
        <div className="email-sent-banner">
          <div className="esb-icon">📧</div>
          <div className="esb-text">
            <strong>E-Ticket Sent!</strong>
            <span>Your e-ticket has been sent to <em>{userEmail || contactInfo?.email}</em></span>
          </div>
          <button className="esb-close" onClick={() => setEmailBanner(false)}>✕</button>
        </div>
      )}

      {/* Success Banner (desktop only) */}
      <div className="conf-banner">
        <div className="conf-checkmark">
          <span>✓</span>
        </div>
        <h1>Booking Confirmed!</h1>
        <p className="conf-subtitle">
          Your e-ticket has been sent to <strong>{userEmail || contactInfo?.email}</strong>.
        </p>
      </div>

      <div className="conf-body">
        {/* ── Ticket Card ── */}
        <div className="conf-ticket">
          {/* Ticket header with logo and booking info */}
          <div className="ticket-header">
            <div className="th-logo">
              🚌 <strong>GoJourney</strong> E-Ticket
            </div>
            <div className="th-status">CONFIRMED</div>
          </div>
          <div className="ticket-meta">
            <span>Booking ID: <strong>{displayBookingId}</strong></span>
            <span>{searchData?.date}</span>
          </div>

          {/* Journey Header */}
          <div className="ticket-journey">
            <div className="tj-city">
              <div className="tj-city-name">{searchData?.from}</div>
              <div className="tj-time">{bus?.departure}</div>
            </div>
            <div className="tj-middle">
              <div className="tj-duration">{bus?.duration}</div>
              <div className="tj-arrow">─────✈─────</div>
              <div className="tj-date">{searchData?.date}</div>
            </div>
            <div className="tj-city right">
              <div className="tj-city-name">{searchData?.to}</div>
              <div className="tj-time">{bus?.arrival}</div>
            </div>
          </div>

          <div className="ticket-divider">
            <div className="td-dot left"></div>
            <div className="td-line"></div>
            <div className="td-dot right"></div>
          </div>

          {/* Details Grid */}
          <div className="ticket-details-grid">
            <div className="tdg-section">
              <h3>Bus Information</h3>
              <div className="tdg-row"><span>Operator</span><strong>{bus?.operator}</strong></div>
              <div className="tdg-row"><span>Bus Type</span><strong>{bus?.busType}</strong></div>
              <div className="tdg-row"><span>Seats</span><strong>{selectedSeats?.join(', ')}</strong></div>
            </div>

            <div className="tdg-section">
              <h3>Contact Info</h3>
              <div className="tdg-row"><span>Name</span><strong>{contactInfo?.name}</strong></div>
              <div className="tdg-row"><span>Email</span><strong>{contactInfo?.email}</strong></div>
              <div className="tdg-row"><span>Phone</span><strong>{contactInfo?.phone}</strong></div>
            </div>
          </div>

          {/* Passengers */}
          <div className="ticket-passengers">
            <h3>Passengers</h3>
            <div className="tp-list">
              {passengers?.map((p, i) => (
                <div key={i} className="tp-card">
                  <div className="tp-avatar">{p.name?.[0]?.toUpperCase()}</div>
                  <div className="tp-info">
                    <div className="tp-name">{p.name}</div>
                    <div className="tp-meta">Age {p.age} • {p.gender}</div>
                  </div>
                  <div className="tp-seat">Seat {p.seatNumber}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="ticket-payment">
            <h3>Payment Details</h3>
            <div className="pay-summary-rows">
              <div className="psr-row"><span>Base Fare</span><span>₹{totalAmount?.toLocaleString()}</span></div>
              <div className="psr-row"><span>Service Fee</span><span>₹{serviceFee}</span></div>
              <div className="psr-row"><span>Taxes</span><span>₹{taxes}</span></div>
              {discountAmount > 0 && (
                <div className="psr-row discount"><span>🎟️ Discount</span><span>- ₹{discountAmount}</span></div>
              )}
              <div className="psr-total"><span>Total Paid</span><span>₹{finalTotal?.toLocaleString()}</span></div>
              <div className="psr-row method">
                <span>Payment Method</span>
                <span>{paymentLabels[paymentMethod] || paymentMethod?.toUpperCase()}</span>
              </div>
              <div className="psr-row"><span>Status</span><span className="status-badge">✅ Paid</span></div>
            </div>
          </div>

          {/* QR code for scanning */}
          <div className="ticket-qr">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${displayBookingId}`}
              alt="QR code"
            />
            <p className="qr-label">Scan for booking details</p>
          </div>
        </div>

        {/* ── Actions + Notes ── */}
        <div className="conf-side">
          <div className="conf-actions">
            <button className="conf-btn-print" onClick={() => window.print()}>
              🖨️ Print / Download Ticket
            </button>
            <Link to="/" className="conf-btn-home">
              🎫 Book Another Ticket
            </Link>
            <button className="conf-btn-bookings" onClick={() => navigate('/profile')}>
              📋 View My Bookings
            </button>
          </div>

          <div className="conf-notes">
            <h3>📌 Important Information</h3>
            <ul>
              <li>Your <strong>e-ticket</strong> has been sent instantly to your registered email.</li>
              <li>You can also view it anytime in the <strong>"My Bookings"</strong> section of your profile.</li>
              <li>Arrive at the boarding point <strong>15 minutes</strong> before departure.</li>
              <li>Carry a valid government-issued <strong>ID proof</strong> for all passengers.</li>
              <li>Show this confirmation or Booking ID to the bus operator.</li>
              <li>For cancellations, contact us at least <strong>4 hours</strong> before departure.</li>
              <li>Support: <strong>support@gojourney.com</strong> | <strong>1800-000-1234</strong></li>
            </ul>
          </div>

          <div className="conf-barcode">
            <div className="barcode-visual">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="bar" style={{ height: `${20 + Math.random() * 30}px` }}></div>
              ))}
            </div>
            <p>{displayBookingId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;
