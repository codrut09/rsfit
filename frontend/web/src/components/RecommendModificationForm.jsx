import React, { useState } from 'react';
import axios from 'axios';

export default function RecommendModificationForm({ clientId, logId }) {
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      await axios.post('http://localhost:8080/api/approvals/recommendations', {
        clientId: clientId,
        logId: logId,
        proposedChanges: {
          action: 'ADJUST_SETS_REPS',
          targetExercise: exercise,
          targetSets: parseInt(sets),
          targetReps: parseInt(reps),
          targetWeight: parseFloat(weight)
        }
      });
      setMessage('Recommendation submitted successfully!');
      setExercise('');
      setSets('');
      setReps('');
      setWeight('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit recommendation');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px', maxWidth: '400px' }}>
      <h3>Propose Modification</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Exercise: </label>
          <input type="text" value={exercise} onChange={e => setExercise(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Sets: </label>
          <input type="number" value={sets} onChange={e => setSets(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Reps: </label>
          <input type="number" value={reps} onChange={e => setReps(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Weight: </label>
          <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} required />
        </div>
        <button type="submit">Send Proposal</button>
      </form>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
