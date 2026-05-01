import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState('');
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    // Check if user just came from login (referrer check)
    const navEntries = window.performance?.getEntriesByType?.('navigation');
    if (navEntries && navEntries[0]?.type === 'navigate') {
      setJustLoggedIn(true);
      setTimeout(() => setJustLoggedIn(false), 4000);
    }

    // 1. Get user from local storage
    const storedUser = localStorage.getItem('gj_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setEditForm({ name: parsedUser.name || '', phone: parsedUser.phone || '' });

    // 2. Fetch live profile data from backend
    fetch(`http://127.0.0.1:5000/profile/${parsedUser.email}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setEditForm({ name: data.user.name || '', phone: data.user.phone || '' });
          localStorage.setItem('gj_user', JSON.stringify({
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || ''
          }));
        }
      })
      .catch(err => console.error("Error fetching profile:", err));

    // 3. Fetch past bookings
    fetch(`http://127.0.0.1:5000/my-bookings/${parsedUser.email}`)
      .then(res => res.json())
      .then(data => {
        if (data.bookings) setBookings(data.bookings);
      })
      .catch(err => console.error("Error fetching bookings:", err))
      .finally(() => setLoading(false));

  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('gj_user');
    navigate('/');
  };

  const handleEditSave = async () => {
    if (!editForm.name.trim()) {
      setEditMsg('❌ Name cannot be empty');
      return;
    }
    setEditLoading(true);
    setEditMsg('');
    try {
      const res = await fetch(`http://127.0.0.1:5000/profile/${user.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editForm.name.trim(), phone: editForm.phone.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        const updated = { ...user, name: editForm.name.trim(), phone: editForm.phone.trim() };
        setUser(updated);
        localStorage.setItem('gj_user', JSON.stringify(updated));
        setEditMsg('✅ Profile updated!');
        setTimeout(() => { setEditMode(false); setEditMsg(''); }, 1500);
      } else {
        setEditMsg(`❌ ${data.error || 'Update failed'}`);
      }
    } catch {
      setEditMsg('❌ Server error. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancel = async (bookingRef) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await fetch(`http://127.0.0.1:5000/cancel/${bookingRef}`, { method: 'POST' });
      setBookings(prev =>
        prev.map(b =>
          b.booking_ref === bookingRef ? { ...b, payment_status: 'failed' } : b
        )
      );
    } catch {
      alert('Could not cancel booking. Please try again.');
    }
  };

  if (!user) return null;

  const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;
  const totalSpent = bookings
    .filter(b => b.payment_status === 'success')
    .reduce((acc, b) => acc + (b.total_amount || 0), 0);

  return (
    <div className="profile-page">
      {/* Welcome Banner */}
      {justLoggedIn && (
        <div className="welcome-banner">
          <span className="wb-emoji">🎉</span>
          <span>Welcome back, <strong>{user.name?.split(' ')[0]}</strong>! Ready for your next journey?</span>
          <button className="wb-close" onClick={() => setJustLoggedIn(false)}>✕</button>
        </div>
      )}

      <div className="profile-container">

        {/* ══════════ LEFT SIDEBAR ══════════ */}
        <div className="profile-sidebar">

          {/* User Card */}
          <div className="profile-card">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{initials}</div>
              <div className="profile-badge">PRO</div>
            </div>

            {editMode ? (
              <div className="edit-form">
                <div className="edit-field">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div className="edit-field">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                {editMsg && (
                  <p className={`edit-msg ${editMsg.startsWith('✅') ? 'success' : 'error'}`}>
                    {editMsg}
                  </p>
                )}
                <div className="edit-actions">
                  <button className="edit-save-btn" onClick={handleEditSave} disabled={editLoading}>
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="edit-cancel-btn" onClick={() => { setEditMode(false); setEditMsg(''); }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="profile-name">{user.name}</h2>
                <p className="profile-email">✉️ {user.email}</p>
                {user.phone && <p className="profile-phone">📞 {user.phone}</p>}
                {memberSince && <p className="profile-since">🗓️ Member since {memberSince}</p>}
                <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
                  ✏️ Edit Profile
                </button>
              </>
            )}

            {/* Stats */}
            <div className="profile-stats">
              <div className="p-stat">
                <h3>{bookings.length}</h3>
                <span>Trips</span>
              </div>
              <div className="p-stat-divider"></div>
              <div className="p-stat">
                <h3>{bookings.reduce((acc, b) => acc + (b.passenger_count || 1), 0)}</h3>
                <span>Seats</span>
              </div>
              <div className="p-stat-divider"></div>
              <div className="p-stat">
                <h3>₹{totalSpent.toFixed(0)}</h3>
                <span>Spent</span>
              </div>
            </div>
          </div>

          {/* Sidebar Menu */}
          <div className="profile-menu">
            <button
              className={`pm-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <span>🎫</span> My Bookings
            </button>
            <button className="pm-btn" onClick={() => navigate('/help')}>
              <span>🎧</span> Help &amp; Support
            </button>
            <button className="pm-btn" onClick={() => navigate('/contact')}>
              <span>📞</span> Contact Us
            </button>
            <button className="pm-btn logout-btn" onClick={handleLogout}>
              <span>🚪</span> Logout
            </button>
          </div>
        </div>

        {/* ══════════ RIGHT MAIN CONTENT ══════════ */}
        <div className="profile-main">
          <div className="pm-header">
            <div className="pm-header-left">
              <h2>My Journey History</h2>
              <p>View and manage all your past and upcoming bus tickets.</p>
            </div>
            <button className="book-now-btn" onClick={() => navigate('/')}>
              + Book a Trip
            </button>
          </div>

          <div className="bookings-list">
            {loading ? (
              <div className="bookings-loading">
                <div className="auth-spinner"></div>
                <p>Loading your journeys...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="no-bookings">
                <span className="nb-icon">🚌</span>
                <h3>No bookings yet!</h3>
                <p>Looks like you haven't booked any bus tickets with us yet. Start your journey today!</p>
                <button onClick={() => navigate('/')}>Book a Bus Now →</button>
              </div>
            ) : (
              bookings.map((b, i) => (
                <div
                  key={i}
                  className="booking-card"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="bc-header">
                    <div className="bc-ref">
                      <span>Booking ID</span>
                      <strong>{b.booking_ref}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={`bc-status ${b.payment_status?.toLowerCase()}`}>
                        {b.payment_status === 'success' ? '✅ Confirmed' : '❌ Cancelled'}
                      </div>
                      {b.payment_status === 'success' && (
                        <button
                          className="bc-eticket-btn"
                          onClick={() => setSelectedTicket(b)}
                          title="View e-ticket"
                        >
                          🎫 E-Ticket
                        </button>
                      )}
                      {b.payment_status === 'success' && (
                        <button
                          className="bc-cancel-btn"
                          onClick={() => handleCancel(b.booking_ref)}
                          title="Cancel booking"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bc-route">
                    <div className="bc-city">
                      <span className="bcc-time">{b.departure}</span>
                      <strong className="bcc-name">{b.from_city}</strong>
                    </div>
                    <div className="bc-arrow">
                      <span>{b.travel_date}</span>
                      <div className="bca-line">
                        <span className="bca-bus">🚌</span>
                      </div>
                    </div>
                    <div className="bc-city" style={{ textAlign: 'right' }}>
                      <span className="bcc-time">{b.arrival}</span>
                      <strong className="bcc-name">{b.to_city}</strong>
                    </div>
                  </div>

                  <div className="bc-footer">
                    <div className="bc-operator">
                      <strong>{b.operator}</strong>
                      <span>{b.bus_type}</span>
                    </div>
                    <div className="bc-seats">
                      <span>Seats: <strong>{b.selected_seats}</strong></span>
                      <span>Total: <strong className="bc-price">₹{b.total_amount}</strong></span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ══════════ E-TICKET MODAL ══════════ */}
      {selectedTicket && (
        <div className="eticket-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="eticket-modal" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="etm-header">
              <div className="etm-logo">🚌 GoJourney</div>
              <div className="etm-title">
                <h2>E-Ticket</h2>
                <span className={`etm-badge ${selectedTicket.payment_status}`}>
                  {selectedTicket.payment_status === 'success' ? '✅ Confirmed' : '❌ Cancelled'}
                </span>
              </div>
              <button className="etm-close" onClick={() => setSelectedTicket(null)}>✕</button>
            </div>

            {/* Email notice */}
            <div className="etm-email-notice">
              <span>📧</span>
              <span>This e-ticket was sent to <strong>{selectedTicket.user_email || selectedTicket.contact_email}</strong></span>
            </div>

            {/* Journey Strip */}
            <div className="etm-journey">
              <div className="etm-city">
                <div className="etm-city-name">{selectedTicket.from_city}</div>
                <div className="etm-time">{selectedTicket.departure}</div>
              </div>
              <div className="etm-middle">
                <div className="etm-duration">🚌</div>
                <div className="etm-arrow">────────────</div>
                <div className="etm-date">{selectedTicket.travel_date}</div>
              </div>
              <div className="etm-city right">
                <div className="etm-city-name">{selectedTicket.to_city}</div>
                <div className="etm-time">{selectedTicket.arrival}</div>
              </div>
            </div>

            {/* Divider notch */}
            <div className="etm-divider">
              <div className="etm-notch left"></div>
              <div className="etm-dash"></div>
              <div className="etm-notch right"></div>
            </div>

            {/* Details Grid */}
            <div className="etm-details">
              <div className="etm-detail-item">
                <span>Booking ID</span>
                <strong>{selectedTicket.booking_ref}</strong>
              </div>
              <div className="etm-detail-item">
                <span>Operator</span>
                <strong>{selectedTicket.operator}</strong>
              </div>
              <div className="etm-detail-item">
                <span>Bus Type</span>
                <strong>{selectedTicket.bus_type}</strong>
              </div>
              <div className="etm-detail-item">
                <span>Seats</span>
                <strong>{selectedTicket.selected_seats}</strong>
              </div>
              <div className="etm-detail-item">
                <span>Passengers</span>
                <strong>{selectedTicket.passenger_count}</strong>
              </div>
              <div className="etm-detail-item">
                <span>Contact Name</span>
                <strong>{selectedTicket.contact_name}</strong>
              </div>
              <div className="etm-detail-item">
                <span>Contact Phone</span>
                <strong>{selectedTicket.contact_phone}</strong>
              </div>
              <div className="etm-detail-item">
                <span>Payment</span>
                <strong>{selectedTicket.payment_method?.toUpperCase()}</strong>
              </div>
            </div>

            {/* Fare Row */}
            <div className="etm-fare">
              <span>Total Amount Paid</span>
              <strong>₹{selectedTicket.total_amount?.toLocaleString()}</strong>
            </div>

            {/* Barcode strip */}
            <div className="etm-barcode">
              <div className="etm-bars">
                {[...Array(40)].map((_, i) => (
                  <div
                    key={i}
                    className="etm-bar"
                    style={{ height: `${14 + Math.sin(i * 0.7) * 10 + Math.random() * 12}px` }}
                  />
                ))}
              </div>
              <p>{selectedTicket.booking_ref}</p>
            </div>

            {/* Actions */}
            <div className="etm-actions">
              <button className="etm-print-btn" onClick={() => window.print()}>
                🖨️ Print Ticket
              </button>
              <button className="etm-close-btn" onClick={() => setSelectedTicket(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
