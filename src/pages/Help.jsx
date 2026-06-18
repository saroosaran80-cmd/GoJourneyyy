import { useState } from 'react';
import './help.css';

const FAQS = [
  { q: 'How do I cancel my booking?', a: 'Enter your Booking ID in the Cancel Ticket section below. Cancellations are free up to 4 hours before departure. Refunds are processed within 5-7 working days.' },
  { q: 'What ID proof is required on board?', a: 'Any government-issued ID: Aadhaar Card, PAN Card, Passport, or Driving License. Digital copies are also accepted.' },
  { q: 'Can I reschedule my journey?', a: 'Yes! Rescheduling is allowed up to 6 hours before departure. Use your Booking ID to raise a rescheduling request below.' },
  { q: 'How do I get my ticket after booking?', a: 'Your e-ticket is sent instantly to your registered email. You can also view it in "My Bookings" section of your profile.' },
  { q: 'What if my bus is delayed?', a: 'In case of delays exceeding 2 hours, you are eligible for a full refund. Contact our support team immediately.' },
  { q: 'Is my payment information secure?', a: 'Absolutely. We use 256-bit SSL encryption and are PCI DSS compliant. Your card details are never stored on our servers.' },
];

function Help() {
  const [openFaq, setOpenFaq] = useState(null);
  const [bookingId, setBookingId] = useState('');
  const [cancelStatus, setCancelStatus] = useState('');
  const [form, setForm] = useState({ name: '', email: '', issue: 'booking', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('faq');

  const handleCancel = (e) => {
    e.preventDefault();
    if (!bookingId.trim()) { setCancelStatus('error'); return; }
    setCancelStatus('loading');
    setTimeout(() => setCancelStatus('success'), 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.message.trim() || !form.email.trim()) return;
    setTimeout(() => setSubmitted(true), 800);
  };

  return (
    <div className="help-page">
      {/* Hero Banner */}
      <div className="help-hero">
        <div className="help-hero-content">
          <div className="help-hero-icon">🎧</div>
          <h1>Help & Support</h1>
          <p>We're available 24/7 to assist you with your journey</p>
          <div className="help-contact-strip">
            <div className="help-contact-pill"><span>📞</span> 1800-000-1234</div>
            <div className="help-contact-pill"><span>📧</span> gojourneytraveling@gmail.com</div>
            <div className="help-contact-pill"><span>💬</span> Live Chat Available</div>
          </div>
        </div>
      </div>

      <div className="help-body">
        {/* Tab Navigation */}
        <div className="help-tabs">
          {[['faq', '❓', 'FAQ'], ['cancel', '🚫', 'Cancel Ticket'], ['contact', '✉️', 'Contact Us']].map(([id, icon, label]) => (
            <button key={id} className={`help-tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ── FAQ Tab ── */}
        {activeTab === 'faq' && (
          <div className="help-panel animate-in">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {FAQS.map((faq, i) => (
                <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{faq.q}</span>
                    <span className="faq-chevron">{openFaq === i ? '▲' : '▼'}</span>
                  </button>
                  {openFaq === i && (
                    <div className="faq-answer">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Cancel Ticket Tab ── */}
        {activeTab === 'cancel' && (
          <div className="help-panel animate-in">
            <h2>Cancel Your Ticket</h2>
            <p className="help-subtitle">Enter your Booking ID to initiate a cancellation request</p>

            <div className="cancel-policy-row">
              <div className="policy-item">
                <div className="policy-icon">⏰</div>
                <div>
                  <strong>till 24hrs</strong>
                  <span>100% Refund</span>
                </div>
              </div>
              <div className="policy-item">
                <div className="policy-icon">🕐</div>
                <div>
                  <strong>4–24hrs</strong>
                  <span>50% Refund</span>
                </div>
              </div>
              <div className="policy-item">
                <div className="policy-icon">❌</div>
                <div>
                  <strong>Under 4hrs</strong>
                  <span>No Refund</span>
                </div>
              </div>
            </div>

            <form className="cancel-form" onSubmit={handleCancel}>
              <div className="help-field">
                <label>Booking ID *</label>
                <input
                  type="text"
                  placeholder="e.g. GJ20260304AABBCC"
                  value={bookingId}
                  onChange={e => { setBookingId(e.target.value.toUpperCase()); setCancelStatus(''); }}
                  className={cancelStatus === 'error' ? 'err' : ''}
                />
                {cancelStatus === 'error' && <span className="help-err">Please enter a valid Booking ID</span>}
              </div>
              <button type="submit" className="help-btn-danger" disabled={cancelStatus === 'loading' || cancelStatus === 'success'}>
                {cancelStatus === 'loading' ? '⏳ Processing…' : cancelStatus === 'success' ? '✅ Cancellation Requested' : '🚫 Cancel Ticket'}
              </button>
              {cancelStatus === 'success' && (
                <div className="cancel-success">
                  <p>✅ Cancellation request submitted for <strong>{bookingId}</strong>.</p>
                  <p>Your refund will be processed within 5–7 working days.</p>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ── Contact Tab ── */}
        {activeTab === 'contact' && (
          <div className="help-panel animate-in">
            <h2>Send Us a Message</h2>
            <p className="help-subtitle">We'll get back to you within 24 hours</p>

            {submitted ? (
              <div className="help-success-screen">
                <div className="help-success-icon">✉️</div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. Our team will contact you at <strong>{form.email}</strong> within 24 hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', issue: 'booking', message: '' }); }}>
                  Send Another →
                </button>
              </div>
            ) : (
              <form className="help-contact-form" onSubmit={handleSubmit}>
                <div className="help-form-row">
                  <div className="help-field">
                    <label>Your Name *</label>
                    <input type="text" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="help-field">
                    <label>Email Address *</label>
                    <input type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div className="help-field">
                  <label>Issue Type</label>
                  <select value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })}>
                    <option value="booking">Booking Issue</option>
                    <option value="payment">Payment Problem</option>
                    <option value="cancellation">Cancellation / Refund</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="help-field">
                  <label>Your Message *</label>
                  <textarea rows={5} placeholder="Describe your issue in detail…" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required></textarea>
                </div>
                <button type="submit" className="help-btn-primary">📤 Send Message</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Help;
