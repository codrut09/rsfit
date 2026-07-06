import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ClientBriefingCard({ clientId }) {
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchBrief();
    }
  }, [clientId]);

  const fetchBrief = () => {
    setLoading(true);
    axios.post('http://localhost:8080/api/ai/brief', {
      timezone: 'Europe/Bucharest',
      client_id: clientId
    })
      .then(res => {
        setBrief(res.data.brief);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setBrief('Failed to load client daily brief.');
        setLoading(false);
      });
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '15px', backgroundColor: '#fafafa' }}>
      <h4>AI Daily Client Briefing Report</h4>
      {loading ? (
        <p>Loading AI brief...</p>
      ) : (
        <p style={{ fontStyle: 'italic', lineHeight: '1.5' }}>"{brief}"</p>
      )}
      <button onClick={fetchBrief} disabled={loading} style={{ padding: '5px 10px', marginTop: '10px' }}>Refresh Report</button>
    </div>
  );
}
