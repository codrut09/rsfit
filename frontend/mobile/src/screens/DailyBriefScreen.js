import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';

export default function DailyBriefScreen() {
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrief();
  }, []);

  const fetchBrief = () => {
    setLoading(true);
    const timezone = 'Europe/Bucharest';
    axios.post('http://localhost:8080/api/ai/brief', { timezone })
      .then(res => {
        setBrief(res.data.brief);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setBrief('Failed to generate brief. Please check your network connection.');
        setLoading(false);
      });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI Daily Coach Briefing</Text>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Coaches are analyzing your day...</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.briefText}>{brief}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={fetchBrief} disabled={loading}>
        <Text style={styles.buttonText}>Regenerate Brief</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9F9F9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  center: { marginVertical: 40, alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 20 },
  briefText: { fontSize: 16, lineHeight: 24, color: '#333' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
