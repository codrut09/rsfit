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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
              <div className="sidebar-logo">F</div>
            </div>
            <h1 className="brand-title" style={{ fontSize: '28px', marginBottom: '10px' }}>RSFIT CONSOLE</h1>
            <p className="auth-subtitle">{isRegister ? 'Register as a professional gym coach' : 'Sign in to access your Extej SaaS dashboard'}</p>
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
          <div className="sidebar-logo">F</div>
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
        <div className="sidebar-footer">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            Active Coach:<br/><strong style={{ color: 'var(--text-main)' }}>{username}</strong>
          </p>
          <button onClick={handleLogout} className="btn-primary" style={{ background: 'var(--accent-red)', padding: '10px', boxShadow: 'none' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Container Content */}
      <div className="main-content">
        {activeTab === 'dashboard' && (
          <div>
            <div className="header-row">
              <div>
                <h1 className="page-title">Dashboard Overview</h1>
                <p className="page-subtitle">Inspect client logs and approve target suggestions.</p>
              </div>
            </div>

            {/* Glowing Widget Cards */}
            <div className="dashboard-grid">
              <div className="stat-widget">
                <div className="widget-label">Total Clients</div>
                <div className="widget-value">3 Active</div>
                <div className="widget-trend trend-up">↑ +12% this week</div>
              </div>
              <div className="stat-widget">
                <div className="widget-label">Daily Workout Sessions</div>
                <div className="widget-value">8 Logs</div>
                <div className="widget-trend trend-up" style={{ color: 'var(--accent-purple)' }}>↑ +5% completed</div>
              </div>
              <div className="stat-widget">
                <div className="widget-label">Target Modifications</div>
                <div className="widget-value">2 Staged</div>
                <div className="widget-trend" style={{ color: 'var(--accent-blue)' }}>● Pending Approvals Hub</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
              <div className="glass-panel">
                <h3 style={{ marginBottom: '20px', fontWeight: '600' }}>Active Associations</h3>
                <CoachDashboard />
              </div>

              <div className="glass-panel">
                <h3 style={{ marginBottom: '15px', fontWeight: '600' }}>RAG Daily Inspector</h3>
                <input 
                  type="text" 
                  placeholder="Paste Client UUID here" 
                  value={selectedClientId} 
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: '15px' }}
                />
                {selectedClientId ? (
                  <ClientBriefingCard clientId={selectedClientId} />
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px' }}>Provide a client UUID to run LLM summary analysis.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roster' && (
          <div>
            <h1 className="page-title" style={{ marginBottom: '30px' }}>Roster Management</h1>
            <div className="glass-panel">
              <ClientRosterPage />
            </div>
          </div>
        )}

        {activeTab === 'workout-mod' && (
          <div>
            <h1 className="page-title" style={{ marginBottom: '30px' }}>Propose Workout Modifications</h1>
            <div className="glass-panel">
              <div className="form-group">
                <label className="form-label">Client ID UUID</label>
                <input 
                  type="text" 
                  placeholder="Paste Client UUID" 
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="form-control"
                  style={{ maxWidth: '440px' }}
                />
              </div>
              {selectedClientId ? (
                <RecommendModificationForm clientId={selectedClientId} />
              ) : (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Please specify a client UUID first.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'nutrition-mod' && (
          <div>
            <h1 className="page-title" style={{ marginBottom: '30px' }}>Propose Calorie & Macro Targets</h1>
            <div className="glass-panel">
              <div className="form-group">
                <label className="form-label">Client ID UUID</label>
                <input 
                  type="text" 
                  placeholder="Paste Client UUID" 
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="form-control"
                  style={{ maxWidth: '440px' }}
                />
              </div>
              {selectedClientId ? (
                <RecommendTargetsForm clientId={selectedClientId} />
              ) : (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Please specify a client UUID first.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
