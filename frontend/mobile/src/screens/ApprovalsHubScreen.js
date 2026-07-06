import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function ApprovalsHubScreen() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = () => {
    axios.get('http://localhost:8080/api/approvals/pending')
      .then(res => {
        setRecommendations(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleAction = async (id, action) => {
    try {
      await axios.post(`http://localhost:8080/api/approvals/recommendations/${id}/action`, { action });
      alert(`Recommendation ${action.toLowerCase()}ed!`);
      fetchRecommendations();
    } catch (e) {
      alert('Error updating recommendation: ' + e.message);
    }
  };

  const renderProposedChanges = (changesStr) => {
    try {
      const changes = typeof changesStr === 'string' ? JSON.parse(changesStr) : changesStr;
      if (changes.action === 'ADJUST_NUTRITION_TARGETS') {
        return (
          <View style={styles.changesBox}>
            <Text style={styles.boldText}>Target Adjustments Proposed:</Text>
            <Text>Calories: {changes.targetCalories} kcal</Text>
            <Text>Protein: {changes.targetProtein}g | Carbs: {changes.targetCarbs}g | Fat: {changes.targetFat}g</Text>
          </View>
        );
      }
      if (changes.action === 'ADJUST_SETS_REPS') {
        return (
          <View style={styles.changesBox}>
            <Text style={styles.boldText}>Modify Exercise: {changes.targetExercise}</Text>
            <Text>Sets: {changes.targetSets} | Reps: {changes.targetReps} | Weight: {changes.targetWeight} kg</Text>
          </View>
        );
      }
      return <Text>{JSON.stringify(changes)}</Text>;
    } catch (e) {
      return <Text>Proposed: {changesStr}</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Approvals Hub</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardCoach}>Coach: {item.coachId}</Text>
              <View style={{ marginVertical: 10 }}>
                {renderProposedChanges(item.proposedChanges)}
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.btn, { backgroundColor: 'green' }]} 
                  onPress={() => handleAction(item.id, 'APPROVE')}
                >
                  <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, { backgroundColor: 'red' }]} 
                  onPress={() => handleAction(item.id, 'REJECT')}
                >
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>All recommendations processed!</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15, backgroundColor: '#fff' },
  cardCoach: { fontSize: 16, fontWeight: '600' },
  changesBox: { padding: 10, backgroundColor: '#f9f9f9', borderRadius: 6, marginVertical: 5 },
  boldText: { fontWeight: 'bold', marginBottom: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btn: { flex: 1, padding: 10, borderRadius: 6, alignItems: 'center', marginHorizontal: 5 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 20, color: '#999', fontSize: 16 }
});
