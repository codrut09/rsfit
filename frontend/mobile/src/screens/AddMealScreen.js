import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import axios from 'axios';

export default function AddMealScreen({ navigation }) {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const submitMeal = async () => {
    if (!foodName || !calories) {
      alert('Food Name and Calories are required');
      return;
    }
    try {
      await axios.post('http://localhost:8080/api/nutrition/logs', {
        foodName,
        calories: parseInt(calories),
        protein: protein ? parseFloat(protein) : 0,
        carbohydrates: carbs ? parseFloat(carbs) : 0,
        fat: fat ? parseFloat(fat) : 0
      });
      alert('Meal logged successfully!');
      setFoodName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      if (navigation) {
        navigation.goBack();
      }
    } catch (e) {
      alert('Error logging meal: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Food Item</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Food Name (e.g. Rice with Chicken)"
        value={foodName}
        onChangeText={setFoodName}
      />
      <TextInput
        style={styles.input}
        placeholder="Calories (kcal)"
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Protein (g)"
        value={protein}
        onChangeText={setProtein}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Carbohydrates (g)"
        value={carbs}
        onChangeText={setCarbs}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Fat (g)"
        value={fat}
        onChangeText={setFat}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={submitMeal}>
        <Text style={styles.buttonText}>Log Meal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 15 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
