import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ClientRosterPage() {
  const [clients, setClients] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    axios.get('http://localhost:8080/api/coaching/clients')
      .then(res => setClients(res.data))
      .catch(err => console.error(err));
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      await axios.post('http://localhost:8080/api/coaching/invite', { email: inviteEmail });
      setMessage('Invitation sent successfully!');
      setInviteEmail('');
      fetchClients();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Invitation failed');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px', fontWeight: '600' }}>Active Clients & Associations</h2>
      
      <form onSubmit={handleInvite} style={{ display: 'flex', gap: '15px', marginBottom: '30px', maxWidth: '500px' }}>
        <input 
          type="email" 
          placeholder="Enter Client Email Address" 
          value={inviteEmail} 
          onChange={e => setInviteEmail(e.target.value)} 
          required 
          className="form-control"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>Invite Client</button>
      </form>
      
      {message ? (
        <p style={{ color: 'var(--accent-purple)', fontWeight: '600', marginBottom: '20px' }}>{message}</p>
      ) : null}
      
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Client ID UUID</th>
              <th>Status</th>
              <th>Date Established</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(rel => (
              <tr key={`${rel.coachId}-${rel.clientId}`}>
                <td style={{ fontFamily: 'monospace' }}>{rel.clientId}</td>
                <td>
                  <span className={`badge ${rel.status === 'ACTIVE' ? 'badge-active' : 'badge-pending'}`}>
                    {rel.status}
                  </span>
                </td>
                <td>{new Date(rel.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                  No clients associated yet. Send invites above to connect!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
