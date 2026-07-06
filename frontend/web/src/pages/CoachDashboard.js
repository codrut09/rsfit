import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CoachDashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8080/api/coaching/clients')
      .then(response => {
        setClients(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Coach Dashboard</h1>
      <h2>My Clients</h2>
      {loading ? <p>Loading clients...</p> : (
        <ul>
          {clients.map(client => (
            <li key={client.id}>{client.email} - Status: {client.status}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
