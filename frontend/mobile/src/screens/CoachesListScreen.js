import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function CoachesListScreen() {
  const [coaches, setCoaches] = useState([]);
  const [coachIdInput, setCoachIdInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = () => {
    axios.get('http://localhost:8080/api/coaching/coaches')
      .then(res => {
        setCoaches(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const acceptInvitation = async () => {
    if (!coachIdInput) return;
    try {
      await axios.post('http://localhost:8080/api/coaching/accept', { coachId: coachIdInput });
      alert('Invitation accepted!');
      setCoachIdInput('');
      fetchCoaches();
    } catch (e) {
      alert('Error accepting invite: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Coaches</Text>
      
      <View style={styles.actionRow}>
        <TextInput
          style={styles.input}
          placeholder="Accept Coach UUID"
          value={coachIdInput}
          onChangeText={setCoachIdInput}
        />
        <TouchableOpacity style={styles.button} onPress={acceptInvitation}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={coaches}
          keyExtractor={(item) => `${item.coachId}-${item.clientId}`}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemName}>Coach UUID: {item.coachId}</Text>
              <Text style={styles.itemMeta}>Status: {item.status}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  actionRow: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginRight: 10 },
  button: { backgroundColor: 'green', padding: 12, borderRadius: 6, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemMeta: { fontSize: 14, color: '#666', marginTop: 5 }
});
