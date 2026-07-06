import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MacroSummary({ label, current, target }) {
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {current.toFixed(1)} / {target > 0 ? target : 'N/A'}
        </Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barForeground, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 16, fontWeight: '500' },
  value: { fontSize: 14, color: '#666' },
  barBackground: { height: 10, backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden' },
  barForeground: { height: '100%', backgroundColor: '#34C759' }
});
