import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function CreatePostScreen() {
  const [type, setType] = useState('player_availability');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    };
    loadUser();
  }, []);

  const handleSubmit = async () => {
    if (!content || !date || !time) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      await api.post('/posts', {
        authorId: user.id,
        type,
        content,
        date,
        time,
        location
      });
      Alert.alert("Success", "Post created successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to create post");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create a Post</Text>
      
      <Text style={styles.label}>Post Type</Text>
      <View style={styles.typeContainer}>
        <TouchableOpacity 
          style={[styles.typeButton, type === 'player_availability' && styles.activeType]}
          onPress={() => setType('player_availability')}
        >
          <Text style={[styles.typeText, type === 'player_availability' && styles.activeTypeText]}>I'm Available</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeButton, type === 'player_requirement' && styles.activeType]}
          onPress={() => setType('player_requirement')}
        >
          <Text style={[styles.typeText, type === 'player_requirement' && styles.activeTypeText]}>Player Needed</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="e.g. Looking for a goalkeeper for tonight's game..."
        multiline
        value={content}
        onChangeText={setContent}
      />

      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
      />

      <Text style={styles.label}>Time</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 7 PM - 8 PM"
        value={time}
        onChangeText={setTime}
      />

      <Text style={styles.label}>Location (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Turf Name or Area"
        value={location}
        onChangeText={setLocation}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Post to Board</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, paddingTop: 40 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#64748b', marginBottom: 10 },
  typeContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  activeType: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  typeText: { color: '#64748b', fontWeight: 'bold' },
  activeTypeText: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#2563eb', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 40 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
