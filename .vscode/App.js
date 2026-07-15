import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [drivers, setDrivers] = useState([]);
  const [races, setRaces] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedRace, setSelectedRace] = useState(0);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ message: 'Ready to predict 🏎️', type: 'success' });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toastTimeout = useRef(null);

  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }
    return response.json();
  };

  const loadDrivers = async () => {
    try {
      const data = await apiCall('/drivers');
      setDrivers(data);
      if (data.length > 0 && !selectedDriver) {
        setSelectedDriver(data[0].id);
      }
    } catch (error) {
      showToast('Failed to load drivers', 'error');
    }
  };

  const loadRaces = async () => {
    try {
      const data = await apiCall('/races');
      setRaces(data);
    } catch (error) {
      showToast('Failed to load races', 'error');
    }
  };

  const loadPredictions = async () => {
    try {
      const data = await apiCall('/predictions');
      setPredictions(data);
    } catch (error) {
      if (error.message !== 'Authentication required') {
        showToast('Failed to load predictions', 'error');
      }
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await apiCall('/leaderboard');
      setLeaderboard(data);
    } catch (error) {
      showToast('Failed to load leaderboard', 'error');
    }
  };

  const loadAllData = () => {
    loadDrivers();
    loadRaces();
    loadLeaderboard();
    if (user) {
      loadPredictions();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    loadAllData();
  }, []);

  useEffect(() => {
    if (user) {
      loadPredictions();
    }
  }, [user]);

  const handleAuth = async () => {
    if (!authUsername || !authPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const endpoint = isSignUp ? '/auth/signup' : '/auth/signin';
      const data = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify({ username: authUsername, password: authPassword })
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthModalOpen(false);
      showToast(`Welcome ${data.user.displayName || data.user.username}!`, 'success');
      loadAllData();
    } catch (error) {
      showToast(error.message, 'error');
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPredictions([]);
    showToast('Signed out successfully', 'info');
  };

  const handleSubmitPrediction = async () => {
    if (!user) {
      showToast('Please sign in to make predictions', 'error');
      setIsAuthModalOpen(true);
      return;
    }
    setLoading(true);
    try {
      const data = await apiCall('/predictions', {
        method: 'POST',
        body: JSON.stringify({ raceId: selectedRace, driverId: selectedDriver })
      });
      showToast(
        `Prediction ${data.updated ? 'updated' : 'saved'} for ${races.find(r => r.id === selectedRace)?.name}`,
        'success'
      );
      loadPredictions();
      loadLeaderboard();
    } catch (error) {
      showToast(error.message, 'error');
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!user) {
      showToast('Please sign in first', 'error');
      return;
    }
    if (!window.confirm('Reset all your predictions?')) return;
    setLoading(true);
    try {
      const data = await apiCall('/predictions', { method: 'DELETE' });
      showToast(`Reset ${data.count} predictions`, 'info');
      loadPredictions();
      loadLeaderboard();
    } catch (error) {
      showToast(error.message, 'error');
    }
    setLoading(false);
  };

  const handleExport = async () => {
    if (!user) {
      showToast('Please sign in to export', 'error');
      return;
    }
    try {
      const data = await apiCall('/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `f1_predictor_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported successfully!', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => {
      // Keep last message
    }, 5000);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-area">
          <i className="fas fa-flag-checkered"></i>
          <h1>F1 Predictor</h1>
          <span>2026</span>
        </div>
        <div className="auth-section">
          <div className="user-badge" onClick={() => {
            if (user) showToast(`Logged in as ${user.displayName || user.username}`, 'info');
            else setIsAuthModalOpen(true);
          }}>
            <i className="fas fa-user"></i>
            <span>{user ? user.displayName || user.username : 'Guest'}</span>
            <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', opacity: 0.6 }}></i>
          </div>
          <button className="btn-outline" onClick={user ? handleSignOut : () => setIsAuthModalOpen(true)}>
            {user ? 'Sign Out' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="predictor-grid">
        {/* Make Prediction */}
        <div className="card">
          <div className="card-title">
            <i className="fas fa-bullseye"></i> Make your prediction
          </div>
          <div className="race-selector">
            <label><i className="far fa-calendar-alt"></i> Select Grand Prix</label>
            <select value={selectedRace} onChange={(e) => setSelectedRace(parseInt(e.target.value))}>
              {races.map(r => (
                <option key={r.id} value={r.id}>{r.flag} {r.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500, color: '#94a3b8', fontSize: '0.9rem' }}>
              <i className="fas fa-helmet-safety"></i> Choose winner
            </span>
            <span style={{ fontSize: '0.75rem', background: '#1e293b', padding: '0.2rem 0.8rem', borderRadius: '30px', color: '#94a3b8' }}>
              {drivers.length} drivers
            </span>
          </div>
          <div className="driver-grid">
            {drivers.map(d => (
              <div
                key={d.id}
                className={`driver-option ${selectedDriver === d.id ? 'selected' : ''}`}
                onClick={() => setSelectedDriver(d.id)}
              >
                <input type="radio" name="driverPick" checked={selectedDriver === d.id} readOnly />
                <span className="driver-flag">{d.flag}</span>
                <span className="driver-name">{d.name}</span>
                <span className="driver-team">{d.team}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={handleSubmitPrediction} disabled={loading}>
            {loading ? <span className="loading-spinner"></span> : <><i className="fas fa-check-circle"></i> Submit prediction</>}
          </button>
          <div className="prediction-rules">
            <span><i className="fas fa-clock"></i> Deadline: race start</span>
            <span><i className="fas fa-star" style={{ color: '#facc15' }}></i> 25 pts correct</span>
            <span><i className="fas fa-plus-circle" style={{ color: '#22c55e' }}></i> 5 pts participation</span>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <div className="card-title">
            <i className="fas fa-trophy"></i> Leaderboard
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', background: '#1e293b', padding: '0.2rem 0.9rem', borderRadius: '40px', fontWeight: 400 }}>
              top 10
            </span>
          </div>
          <table className="leaderboard-table">
            <thead><tr><th>#</th><th>User</th><th style={{ textAlign: 'right' }}>Pts</th></tr></thead>
            <tbody>
              {leaderboard.map((entry, idx) => {
                const isCurrentUser = user && entry.user === user.username;
                let rankClass = '';
                if (idx === 0) rankClass = 'rank-1';
                else if (idx === 1) rankClass = 'rank-2';
                else if (idx === 2) rankClass = 'rank-3';
                return (
                  <tr key={entry.user}>
                    <td><span className={`rank-badge ${rankClass}`}>{idx + 1}</span></td>
                    <td style={{ fontWeight: 500 }}>{entry.displayName || entry.user} {isCurrentUser ? '⭐' : ''}</td>
                    <td style={{ textAlign: 'right' }}><span className="points-badge">{entry.points}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="leaderboard-footer">
            <button className="btn-secondary" onClick={loadLeaderboard} style={{ padding: '0.4rem 1rem' }}>
              <i className="fas fa-sync-alt"></i> refresh
            </button>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
              <i className="fas fa-users"></i> {leaderboard.length} players
            </span>
          </div>
        </div>
      </div>

      {/* My Predictions */}
      <div className="card" style={{ marginBottom: '1.2rem' }}>
        <div className="card-title">
          <i className="fas fa-list-ul"></i> My predictions
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', background: '#1e293b', padding: '0.2rem 0.9rem', borderRadius: '40px', fontWeight: 400 }}>
            {predictions.length} this season
          </span>
        </div>
        <div className="prediction-list">
          {predictions.length === 0 ? (
            <div className="empty-state"><i className="far fa-hourglass"></i> No predictions yet</div>
          ) : (
            predictions.map((p, idx) => {
              const race = races.find(r => r.id === p.raceId);
              const driver = drivers.find(d => d.id === p.driverId);
              return (
                <div key={idx} className="prediction-item">
                  <span className="race-name">{race?.flag || '🏁'} {race?.name || 'Unknown Race'}</span>
                  <span className="pick">{driver?.flag || '🏎️'} {driver?.code || '???'}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="footer-actions">
        <div className={`toast-message ${toast.type}`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-circle' : 'fa-exclamation-triangle'}`}></i>
          {toast.message}
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button className="btn-secondary" onClick={handleReset}><i className="fas fa-undo-alt"></i> Reset</button>
          <button className="btn-secondary" style={{ background: '#1e293b', borderColor: '#334155' }} onClick={handleExport}>
            <i className="fas fa-download"></i> Export
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsAuthModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setIsAuthModalOpen(false)}>&times;</button>
            <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
            <input
              type="text"
              placeholder="Username"
              value={authUsername}
              onChange={(e) => setAuthUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && document.getElementById('authPassword').focus()}
            />
            <input
              id="authPassword"
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            />
            <button className="btn-primary" onClick={handleAuth} disabled={loading}>
              {loading ? <span className="loading-spinner"></span> : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
            <button className="btn-secondary" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;