import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    successfulBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [topRoutes, setTopRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/admin/analytics');
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data.analytics);
        setRecentBookings(data.recentBookings);
        setTopRoutes(data.topRoutes);
      } else {
        setError(data.error || 'Failed to load analytics');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1>🚌 Admin Dashboard</h1>
          <button className="btn-refresh" onClick={fetchAnalytics}>
            🔄 Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="error-banner">{error}</div>}

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            🎫 Recent Bookings
          </button>
          <button
            className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
            onClick={() => setActiveTab('routes')}
          >
            🗺️ Top Routes
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="admin-section">
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon">🎫</div>
                <div className="kpi-content">
                  <p className="kpi-label">Total Bookings</p>
                  <p className="kpi-value">{analytics.totalBookings}</p>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon">💰</div>
                <div className="kpi-content">
                  <p className="kpi-label">Total Revenue</p>
                  <p className="kpi-value">₹{analytics.totalRevenue.toLocaleString()}</p>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon">👥</div>
                <div className="kpi-content">
                  <p className="kpi-label">Total Users</p>
                  <p className="kpi-value">{analytics.totalUsers}</p>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon">✅</div>
                <div className="kpi-content">
                  <p className="kpi-label">Successful Bookings</p>
                  <p className="kpi-value">{analytics.successfulBookings}</p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="summary-section">
              <h2>📈 Summary Statistics</h2>
              <div className="stats-box">
                <div className="stat-item">
                  <span className="stat-label">Success Rate:</span>
                  <span className="stat-value">
                    {analytics.totalBookings > 0
                      ? ((analytics.successfulBookings / analytics.totalBookings) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average Booking Value:</span>
                  <span className="stat-value">
                    ₹
                    {analytics.totalBookings > 0
                      ? (analytics.totalRevenue / analytics.totalBookings).toFixed(0)
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RECENT BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="admin-section">
            <h2>🎫 Recent Bookings</h2>
            {recentBookings.length > 0 ? (
              <div className="bookings-table">
                <div className="table-header">
                  <div>Booking ID</div>
                  <div>From → To</div>
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
                {recentBookings.map((booking, idx) => (
                  <div key={idx} className="table-row">
                    <div className="booking-ref">{booking.booking_ref}</div>
                    <div className="route">
                      {booking.from_city} → {booking.to_city}
                    </div>
                    <div>{new Date(booking.travel_date).toLocaleDateString()}</div>
                    <div className="amount">₹{booking.total_amount}</div>
                    <div>
                      <span
                        className={`status-badge status-${booking.payment_status}`}
                      >
                        {booking.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No bookings found</p>
            )}
          </div>
        )}

        {/* TOP ROUTES TAB */}
        {activeTab === 'routes' && (
          <div className="admin-section">
            <h2>🗺️ Top Routes</h2>
            {topRoutes.length > 0 ? (
              <div className="routes-list">
                {topRoutes.map((route, idx) => (
                  <div key={idx} className="route-card">
                    <div className="route-rank">{idx + 1}</div>
                    <div className="route-details">
                      <h3>{route.from_city} → {route.to_city}</h3>
                      <p>{route.count} bookings | Revenue: ₹{route.total_revenue.toLocaleString()}</p>
                    </div>
                    <div className="route-badge">{route.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No route data available</p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="admin-footer">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
