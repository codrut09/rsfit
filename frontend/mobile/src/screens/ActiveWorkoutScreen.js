import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import axios from 'axios';

export default function ActiveWorkoutScreen({ route, navigation }) {
  const { logId } = route.params || { logId: 'dummy-id' };
  const [exercise, setExercise] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [sets, setSets] = useState([]);

  const addSet = () => {
    if (!reps || !weight) return;
    const newSet = {
      setIndex: sets.length,
      reps: parseInt(reps),
      weight: parseFloat(weight),
      completed: true
    };
    setSets([...sets, newSet]);
    setReps('');
    setWeight('');
  };

  const saveSets = async () => {
    if (!exercise || sets.length === 0) return;
    try {
      await axios.put(`http://localhost:8080/api/workouts/logs/${logId}/sets`, {
        exerciseName: exercise,
        sets: sets
      });
      alert('Sets saved successfully!');
    } catch (e) {
      alert('Error saving sets: ' + e.message);
    }
  };

  const finishWorkout = async () => {
    try {
      await axios.post(`http://localhost:8080/api/workouts/logs/${logId}/finish`);
      alert('Workout Completed!');
      if (navigation) {
        navigation.navigate('WorkoutHistory');
      }
    } catch (e) {
      alert('Error finishing workout: ' + e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Track Workout</Text>
      <TextInput
        style={styles.input}
        placeholder="Exercise Name (e.g. Squat)"
        value={exercise}
        onChangeText={setExercise}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 10 }]}
          placeholder="Reps"
          value={reps}
          onChangeText={setReps}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Weight (kg)"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={addSet}>
        <Text style={styles.buttonText}>Add Set</Text>
      </TouchableOpacity>

      <FlatList
        data={sets}
        keyExtractor={(item) => item.setIndex.toString()}
        renderItem={({ item }) => (
          <Text style={styles.setItem}>Set {item.setIndex + 1}: {item.reps} reps @ {item.weight} kg</Text>
        )}
        style={styles.list}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: 'green', marginTop: 10 }]} onPress={saveSets}>
        <Text style={styles.buttonText}>Save Exercise Sets</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: 'red', marginTop: 15 }]} onPress={finishWorkout}>
        <Text style={styles.buttonText}>Finish Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  setItem: { fontSize: 16, paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: '#ccc' },
  list: { marginVertical: 15 }
});
