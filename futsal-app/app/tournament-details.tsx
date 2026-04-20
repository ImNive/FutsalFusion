import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function TournamentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTournament();
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  };

  const fetchTournament = async () => {
    try {
      // For now, I'll fetch all and filter, or I could add a specific route
      const response = await api.get('/tournaments');
      const found = response.data.find((t: any) => t._id === id);
      setTournament(found);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch tournament details");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      // In a real app, we'd probably have a teams model, but for now let's just add to array
      // This logic should ideally be on the backend
      Alert.alert(
        "Register Team",
        "Click confirm to register your team for Visa/Mastercard payment of Rs. " + tournament.entryFee,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Confirm", onPress: async () => {
             // Mock payment success and registration
             Alert.alert("Success", "Tournament registration successful!");
             router.back();
          }}
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to register");
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!tournament) return <Text>Tournament not found</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{tournament.name}</Text>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.description}>{tournament.description || "No description provided."}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{tournament.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{tournament.startDate} to {tournament.endDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Entry Fee</Text>
          <Text style={styles.value}>Rs. {tournament.entryFee}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Prize Pool</Text>
          <Text style={styles.value}>{tournament.prizePool}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Teams</Text>
          <Text style={styles.value}>{tournament.registeredTeams?.length || 0} / {tournament.maxTeams}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Register Team</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1e293b', marginBottom: 20, paddingTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2563eb', marginBottom: 10 },
  description: { color: '#64748b', lineHeight: 22, marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { color: '#64748b', fontWeight: '500' },
  value: { color: '#1e293b', fontWeight: 'bold' },
  registerButton: { backgroundColor: '#2563eb', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 40 },
  registerButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
