import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function TournamentsScreen() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadUser();
    fetchTournaments();
  }, []);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) setCurrentUser(JSON.parse(userData));
  };

  const fetchTournaments = async () => {
    try {
      const response = await api.get('tournaments');
      // Only show top 10 recent/upcoming for focus
      setTournaments(response.data.slice(0, 10));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Remove Tournament",
      "Are you sure you want to cancel this event?",
      [
        { text: "No", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await api.delete(`tournaments/${id}`);
            fetchTournaments();
          } catch (e) {
            Alert.alert("Error", "Could not delete tournament");
          }
        }}
      ]
    );
  };

  const renderItem = ({ item }: any) => {
    const isOrganizer = currentUser && item.organizerId?._id === currentUser.id;

    return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.status}>{item.status.toUpperCase()}</Text>
          </View>
          
          <Text style={styles.location}>📍 {item.location}</Text>
          <Text style={styles.date}>📅 {item.startDate}</Text>
          
          <View style={styles.details}>
            <Text style={styles.detailText}>Fee: Rs. {item.entryFee}</Text>
            <Text style={styles.detailText}>Prize: {item.prizePool}</Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.organizer}>Organized by: {item.organizerId?.name || 'Manager'}</Text>
            {isOrganizer && (
               <TouchableOpacity onPress={() => handleDelete(item._id)}>
                   <Text style={styles.deleteLink}>Delete</Text>
               </TouchableOpacity>
            )}
          </View>
        </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Upcoming Events</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => router.push('/create-tournament' as any)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tournaments}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchTournaments}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1e293b' },
  addButton: { backgroundColor: '#2563eb', width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  addButtonText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#2563eb' },
  status: { fontSize: 10, color: '#64748b', backgroundColor: '#e2e8f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  location: { color: '#475569', fontSize: 14, marginBottom: 4 },
  date: { color: '#475569', fontSize: 14, marginBottom: 12 },
  details: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10, marginBottom: 10 },
  detailText: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  organizer: { fontSize: 11, color: '#94a3b8' },
  deleteLink: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
