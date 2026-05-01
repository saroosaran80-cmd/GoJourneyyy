import React, { useState } from 'react';
import './signup.css';

export default function Register({ onShowLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---------------- HANDLE CHANGE ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
  };

  // ---------------- PASSWORD VALIDATION ----------------
  const validatePassword = (pwd) => {
    // Minimum 8 chars, at least 1 letter and 1 number
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return re.test(pwd);
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }

    if (!validatePassword(form.password)) {
      setError('Password must be at least 8 characters with letters & numbers');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      alert('Signup successful! Please login.');
      onShowLogin();

      // Reset form
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box">
      <h2 className="auth-heading">Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <small style={{
          fontSize: '10px',
          color: '#666',
          marginTop: '-10px',
          marginBottom: '10px',
          display: 'block'
        }}>
          (Min 8 chars, letters & numbers)
        </small>

        {error && <p className="error-text">{error}</p>}

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="switch-text">
        Already user?{' '}
        <span onClick={onShowLogin}>Click here</span>
      </p>
    </div>
  );
}