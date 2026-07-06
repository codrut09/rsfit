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
    <div style={{ padding: '20px' }}>
      <h1>My Clients Roster</h1>
      
      <form onSubmit={handleInvite} style={{ marginBottom: '20px' }}>
        <input 
          type="email" 
          placeholder="Client Email" 
          value={inviteEmail} 
          onChange={e => setInviteEmail(e.target.value)} 
          required 
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '8px 12px' }}>Invite Client</button>
      </form>
      
      {message ? <p>{message}</p> : null}
      
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Client ID</th>
            <th>Status</th>
            <th>Established</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(rel => (
            <tr key={`${rel.coachId}-${rel.clientId}`}>
              <td>{rel.clientId}</td>
              <td>{rel.status}</td>
              <td>{new Date(rel.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
