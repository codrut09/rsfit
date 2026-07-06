import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CoachDashboard from './pages/CoachDashboard';
import ClientRosterPage from './pages/ClientRosterPage';
import RecommendModificationForm from './components/RecommendModificationForm';
import RecommendTargetsForm from './components/RecommendTargetsForm';
import ClientBriefingCard from './components/ClientBriefingCard';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('COACH');
  const [isRegister, setIsRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', { email, password });
      const newToken = response.data.token;
      const userRole = response.data.role;

      if (userRole !== 'COACH') {
        alert('Access denied: Coach account required for Web Console');
        return;
      }

      localStorage.setItem('token', newToken);
      localStorage.setItem('username', email);
      setToken(newToken);
      setUsername(email);
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/auth/register', { email, password, role });
      alert('Registration successful! Please log in.');
      setIsRegister(false);
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken('');
    setUsername('');
    setSelectedClientId('');
  };

  if (!token) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="brand-title" style={{ fontSize: '32px', marginBottom: '10px' }}>RSFIT</h1>
            <h2 className="auth-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="auth-subtitle">{isRegister ? 'Register as a professional gym coach' : 'Sign in to access coach dash'}</p>
          </div>

          <form onSubmit={isRegister ? handleRegister : handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="coach@rsfit.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {isRegister && (
              <div className="form-group">
                <label className="form-label">Account Role</label>
                <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="COACH">Coach</option>
                  <option value="CLIENT">Client</option>
                </select>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
              {isRegister ? 'Register' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span 
              onClick={() => setIsRegister(!isRegister)} 
              style={{ color: 'var(--accent-purple)', cursor: 'pointer', fontWeight: '600' }}
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="brand-title">RSFIT CONSOLE</h1>
        </div>
        <ul className="sidebar-menu">
          <li className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </li>
          <li className={`menu-item ${activeTab === 'roster' ? 'active' : ''}`} onClick={() => setActiveTab('roster')}>
            Client Roster & Invites
          </li>
          <li className={`menu-item ${activeTab === 'workout-mod' ? 'active' : ''}`} onClick={() => setActiveTab('workout-mod')}>
            Propose Workouts
          </li>
          <li className={`menu-item ${activeTab === 'nutrition-mod' ? 'active' : ''}`} onClick={() => setActiveTab('nutrition-mod')}>
            Propose Targets
          </li>
        </ul>
        <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            Logged in as:<br/><strong style={{ color: 'var(--text-main)' }}>{username}</strong>
          </p>
          <button onClick={handleLogout} className="btn-primary" style={{ background: 'var(--accent-red)', padding: '8px' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Container Content */}
      <div className="main-content">
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.5px' }}>Dashboard Overview</h1>
                <p style={{ color: 'var(--text-muted)' }}>Monitor your active gym clients metrics.</p>
              </div>
            </div>

            <div className="card-panel">
              <CoachDashboard />
            </div>

            <div className="card-panel">
              <h3 style={{ marginBottom: '15px' }}>Select Client to Inspect</h3>
              <input 
                type="text" 
                placeholder="Paste Client UUID here" 
                value={selectedClientId} 
                onChange={e => setSelectedClientId(e.target.value)}
                className="form-control"
                style={{ maxWidth: '400px', marginBottom: '15px' }}
              />
              {selectedClientId ? (
                <ClientBriefingCard clientId={selectedClientId} />
              ) : (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Please enter a Client UUID to fetch RAG Daily Reports.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'roster' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '30px' }}>Roster Management</h1>
            <div className="card-panel">
              <ClientRosterPage />
            </div>
          </div>
        )}

        {activeTab === 'workout-mod' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '30px' }}>Propose Workout Modifications</h1>
            <div className="card-panel">
              <label className="form-label">Client ID UUID</label>
              <input 
                type="text" 
                placeholder="Client UUID" 
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                className="form-control"
                style={{ maxWidth: '400px', marginBottom: '20px' }}
              />
              {selectedClientId ? (
                <RecommendModificationForm clientId={selectedClientId} />
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>Provide a client UUID above to recommend exercises set edits.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'nutrition-mod' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '30px' }}>Propose Calorie & Macro Targets</h1>
            <div className="card-panel">
              <label className="form-label">Client ID UUID</label>
              <input 
                type="text" 
                placeholder="Client UUID" 
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                className="form-control"
                style={{ maxWidth: '400px', marginBottom: '20px' }}
              />
              {selectedClientId ? (
                <RecommendTargetsForm clientId={selectedClientId} />
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>Provide a client UUID above to propose new calorie macro goals.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
