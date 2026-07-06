import React, { useState } from 'react';
import axios from 'axios';

export default function RecommendTargetsForm({ clientId }) {
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      await axios.post('http://localhost:8080/api/nutrition/targets', {
        clientId: clientId,
        proposedChanges: {
          action: 'ADJUST_NUTRITION_TARGETS',
          targetCalories: parseInt(calories),
          targetProtein: parseInt(protein),
          targetCarbs: parseInt(carbs),
          targetFat: parseInt(fat)
        }
      });
      setMessage('Nutrition target recommendation submitted successfully!');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit recommendation');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px', maxWidth: '400px' }}>
      <h3>Propose Nutrition Targets</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Calories (kcal): </label>
          <input type="number" value={calories} onChange={e => setCalories(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Protein (g): </label>
          <input type="number" value={protein} onChange={e => setProtein(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Carbohydrates (g): </label>
          <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Fat (g): </label>
          <input type="number" value={fat} onChange={e => setFat(e.target.value)} required />
        </div>
        <button type="submit">Send Proposal</button>
      </form>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
