import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import MacroSummary from '../components/MacroSummary';

export default function NutritionDashboard({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = () => {
    const timezone = 'Europe/Bucharest';
    axios.get(`http://localhost:8080/api/nutrition/summary?timezone=${timezone}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const aggregates = data?.aggregates || { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };
  const targets = data?.targets || { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Daily Nutrition Progress</Text>
      
      <View style={styles.card}>
        <MacroSummary label="Calories (kcal)" current={aggregates.calories} target={targets.calories} />
        <MacroSummary label="Protein (g)" current={aggregates.protein} target={targets.protein} />
        <MacroSummary label="Carbs (g)" current={aggregates.carbohydrates} target={targets.carbohydrates} />
        <MacroSummary label="Fat (g)" current={aggregates.fat} target={targets.fat} />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation && navigation.navigate('AddMeal')}
      >
        <Text style={styles.buttonText}>Log Meal +</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9F9F9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 20 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
