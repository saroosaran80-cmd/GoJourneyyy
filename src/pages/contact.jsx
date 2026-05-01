import { useState } from 'react';
import './contact.css';

const OFFICES = [
  { city: 'Chennai', address: '24, Anna Salai, Chennai - 600002', phone: '044-2851-0000', icon: '🏙️' },
  { city: 'Mumbai', address: 'Nariman Point, Mumbai - 400021', phone: '022-6651-0000', icon: '🌆' },
  { city: 'Delhi', address: 'Connaught Place, New Delhi - 110001', phone: '011-4321-0000', icon: '🏛️' },
];

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Valid email is required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim() || form.message.length < 10) e.message = 'Message must be at least 10 characters';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSending(true);
    setTimeout(() => { setSending(false); setSubmitted(true); }, 1500);
  };

  return (
    <div className="ct-page">
      {/* Hero */}
      <div className="ct-hero">
        <div className="ct-hero-content">
          <h1>Get In Touch</h1>
          <p>We'd love to hear from you. Our friendly team is always here to help.</p>
        </div>
        <div className="ct-hero-cards">
          <div className="ct-hero-card">
            <span>📞</span>
            <strong>Call Us</strong>
            <p>1800-000-1234</p>
            <small>Mon–Sun, 6AM–11PM</small>
          </div>
          <div className="ct-hero-card">
            <span>📧</span>
            <strong>Email Us</strong>
            <p>gojourneytraveling@gmail</p>
            <small>Reply within 24hrs</small>
          </div>
          <div className="ct-hero-card">
            <span>💬</span>
            <strong>Live Chat</strong>
            <p>Available 24/7</p>
            <small>Instant responses</small>
          </div>
        </div>
      </div>

      <div className="ct-body">
        {/* Form */}
        <div className="ct-form-section">
          <div className="ct-glass-card">
            {submitted ? (
              <div className="ct-success">
                <div className="ct-success-icon">🎉</div>
                <h2>Message Sent!</h2>
                <p>Thanks, <strong>{form.name}</strong>! We'll get back to you at <strong>{form.email}</strong> within 24 hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}>
                  ← Send Another
                </button>
              </div>
            ) : (
              <>
                <h2 className="ct-form-title">Send Us a Message</h2>
                <form onSubmit={handleSubmit}>
                  <div className="ct-form-row">
                    <div className="ct-field">
                      <label>Full Name *</label>
                      <input type="text" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={errors.name ? 'err' : ''} />
                      {errors.name && <span className="ct-err">{errors.name}</span>}
                    </div>
                    <div className="ct-field">
                      <label>Email Address *</label>
                      <input type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={errors.email ? 'err' : ''} />
                      {errors.email && <span className="ct-err">{errors.email}</span>}
                    </div>
                  </div>
                  <div className="ct-form-row">
                    <div className="ct-field">
                      <label>Phone Number</label>
                      <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="ct-field">
                      <label>Subject *</label>
                      <input type="text" placeholder="How can we help?" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className={errors.subject ? 'err' : ''} />
                      {errors.subject && <span className="ct-err">{errors.subject}</span>}
                    </div>
                  </div>
                  <div className="ct-field">
                    <label>Message *</label>
                    <textarea rows={5} placeholder="Describe your query in detail…" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className={errors.message ? 'err' : ''}></textarea>
                    {errors.message && <span className="ct-err">{errors.message}</span>}
                    <span className="ct-char-count">{form.message.length} / 500</span>
                  </div>
                  <button type="submit" className="ct-submit-btn" disabled={sending}>
                    {sending ? '⏳ Sending…' : '🚀 Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Side Info */}
        <div className="ct-side">
          {/* Social */}
          <div className="ct-glass-card ct-social-card">
            <h3>Follow Us</h3>
            <div className="ct-socials">
              {[['🐦', 'Twitter', '@GoJourney'], ['📘', 'Facebook', '/GoJourney'], ['📸', 'Instagram', '@gojourney_in'], ['▶️', 'YouTube', '/GoJourneyTV']].map(([icon, name, handle]) => (
                <div key={name} className="ct-social-item">
                  <span className="ct-social-icon">{icon}</span>
                  <div><strong>{name}</strong><span>{handle}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Offices */}
          <div className="ct-glass-card">
            <h3>Our Offices</h3>
            <div className="ct-offices">
              {OFFICES.map(o => (
                <div key={o.city} className="ct-office">
                  <div className="ct-office-icon">{o.icon}</div>
                  <div>
                    <strong>{o.city}</strong>
                    <p>{o.address}</p>
                    <span>{o.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Response time */}
          <div className="ct-glass-card ct-response-card">
            <h3>⚡ Response Times</h3>
            <div className="ct-response-list">
              {[['Live Chat', '~2 minutes', 'fast'], ['Phone', '~5 minutes', 'fast'], ['Email', '~4 hours', 'medium'], ['Social Media', '~12 hours', 'slow']].map(([ch, time, speed]) => (
                <div key={ch} className="ct-response-row">
                  <span>{ch}</span>
                  <span className={`ct-speed ${speed}`}>{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
