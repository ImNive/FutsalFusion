import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../../services/api';

const TIERS = [
  { label: "Elite (Top Tier)", value: "Benfica" },
  { label: "Advanced (Pro)", value: "SC Braga" },
  { label: "Strong (Competitive)", value: "Quinta dos Lombos" },
  { label: "Average (Mid)", value: "Torreense" },
  { label: "Rising Star (Amateur)", value: "ADCR Caxinas Poca Barca" }
];

export default function PredictorScreen() {
  const [localTeamA, setLocalTeamA] = useState("");
  const [localTeamB, setLocalTeamB] = useState("");
  const [tierA, setTierA] = useState(TIERS[2].value);
  const [tierB, setTierB] = useState(TIERS[2].value);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const handlePredict = async () => {
    if (!localTeamA || !localTeamB) {
      Alert.alert('Error', 'Please enter both team names');
      return;
    }

    if (localTeamA === localTeamB) {
      Alert.alert('Error', 'Please enter two different team names');
      return;
    }

    setLoading(true);
    try {
      // Map local tiers back to the professional teams the model was trained on
      const response = await api.post('/predict', { 
        teamA: tierA, 
        teamB: tierB 
      });
      setPrediction(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Prediction failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Local AI Predictor</Text>
        <Text style={styles.subtitle}>Predict winnings for local tournaments using our AI model.</Text>
      </View>

      <View style={styles.selectionCard}>
        {/* TEAM A */}
        <Text style={styles.label}>Team A Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter local team name..."
          value={localTeamA}
          onChangeText={setLocalTeamA}
        />
        <Text style={styles.smallLabel}>Skill Tier</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tierA}
            onValueChange={(v) => setTierA(v)}
          >
            {TIERS.map((t) => (
              <Picker.Item key={t.value} label={t.label} value={t.value} />
            ))}
          </Picker>
        </View>

        <Text style={styles.vs}>VS</Text>

        {/* TEAM B */}
        <Text style={styles.label}>Team B Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter local team name..."
          value={localTeamB}
          onChangeText={setLocalTeamB}
        />
        <Text style={styles.smallLabel}>Skill Tier</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tierB}
            onValueChange={(v) => setTierB(v)}
          >
            {TIERS.map((t) => (
              <Picker.Item key={t.value} label={t.label} value={t.value} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity 
          style={styles.predictButton} 
          onPress={handlePredict}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.predictButtonText}>Calculate Win Probability</Text>
          )}
        </TouchableOpacity>
      </View>

      {prediction && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Prediction results for {localTeamA} vs {localTeamB}</Text>
          
          <View style={styles.winnerDisplay}>
             <Text style={styles.winnerLabel}>Probable Winner:</Text>
             <Text style={styles.winnerText}>
                {prediction.winner === tierA ? localTeamA : (prediction.winner === tierB ? localTeamB : "Possible Draw")}
             </Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{localTeamA} Chance:</Text>
              <Text style={styles.statValue}>{prediction.probabilities[tierA]}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{localTeamB} Chance:</Text>
              <Text style={styles.statValue}>{prediction.probabilities[tierB]}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Draw Chance:</Text>
              <Text style={styles.statValue}>{prediction.probabilities.draw}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 5 },
  selectionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 5 },
  smallLabel: { fontSize: 12, color: '#64748b', marginBottom: 5 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 15
  },
  pickerContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 15,
    overflow: 'hidden',
  },
  vs: { textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#cbd5e1', marginVertical: 10 },
  predictButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  predictButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 8,
    borderLeftColor: '#10b981',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  resultTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  winnerDisplay: { marginBottom: 20 },
  winnerLabel: { fontSize: 12, color: '#64748b' },
  winnerText: { fontSize: 26, fontWeight: 'bold', color: '#10b981' },
  statsContainer: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 15 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { fontSize: 14, color: '#475569' },
  statValue: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
});
