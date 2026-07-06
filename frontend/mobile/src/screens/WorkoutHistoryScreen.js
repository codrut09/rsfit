import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function WorkoutHistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8080/api/workouts/logs')
      .then(response => {
        setHistory(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Workout History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <Text style={styles.logName}>{item.name}</Text>
              <Text style={styles.logMeta}>Status: {item.status} | Started: {new Date(item.startTime).toLocaleDateString()}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No workouts logged yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  logItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  logName: { fontSize: 18, fontWeight: '600' },
  logMeta: { fontSize: 14, color: '#666', marginTop: 5 },
  empty: { textAlign: 'center', marginTop: 20, color: '#999', fontSize: 16 }
});
