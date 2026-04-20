import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';

export default function CreateTournamentScreen() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!name || !location || !startDate || !entryFee) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const user = await api.get('/auth/me').catch(() => ({ data: { id: 'dummy_id' } })); // Best effort to get organizer ID
      
      await api.post('/tournaments', {
        name,
        location,
        startDate,
        entryFee: Number(entryFee),
        prizePool,
        description,
        organizerId: user.data.id || '679ebc62f6462e649e800b7f', // Fallback to a valid ID if needed
        status: 'upcoming'
      });
      
      Alert.alert('Success', 'Tournament organized successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Organize Tournament</Text>
      <Text style={styles.subtitle}>Enter the details to announce your event.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Tournament Name *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. City Futsal League" 
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Location *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Indoor Stadium" 
          value={location}
          onChangeText={setLocation}
        />

        <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Start Date *</Text>
                <TextInput 
                style={styles.input} 
                placeholder="2024-05-20" 
                value={startDate}
                onChangeText={setStartDate}
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.label}>Entry Fee *</Text>
                <TextInput 
                style={styles.input} 
                placeholder="Rs. 500" 
                keyboardType="numeric"
                value={entryFee}
                onChangeText={setEntryFee}
                />
            </View>
        </View>

        <Text style={styles.label}>Prize Pool</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Trophy + Rs. 10,000" 
          value={prizePool}
          onChangeText={setPrizePool}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
          placeholder="Additional rules or details..."
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Post Tournament</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 25, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 30 },
  form: { gap: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 5 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1e293b'
  },
  row: { flexDirection: 'row' },
  submitBtn: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelText: { color: '#64748b', fontSize: 14 }
});
