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
    <div>
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading clients roster...</p>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Client ID UUID</th>
                <th>Relationship Status</th>
                <th>Established Date</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={`${client.coachId}-${client.clientId}`}>
                  <td style={{ fontFamily: 'monospace' }}>{client.clientId}</td>
                  <td>
                    <span className={`badge ${client.status === 'ACTIVE' ? 'badge-active' : 'badge-pending'}`}>
                      {client.status}
                    </span>
                  </td>
                  <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                    No active client relationships found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
