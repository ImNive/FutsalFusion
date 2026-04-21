import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Linking, Modal, TextInput } from 'react-native';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DATES = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  return {
    label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
    value: date.toISOString().split('T')[0],
  };
});

export default function BookingScreen() {
  const [turfs, setTurfs] = useState<any[]>([]);
  const [selectedTurfIds, setSelectedTurfIds] = useState<string[]>([]);
  const [selectedDateValue, setSelectedDateValue] = useState(DATES[0].value);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);

  // Simulation for payment
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");

  useEffect(() => {
    fetchTurfs();
    loadUser();
    fetchMyBookings();
  }, []);

  useEffect(() => {
    if (selectedTurfIds.length > 0) {
      fetchSlotStatus();
    }
  }, [selectedTurfIds, selectedDateValue]);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  };

  const fetchTurfs = async () => {
    try {
      const response = await api.get('turfs?activeOnly=true'); // Only show open turfs
      setTurfs(response.data);
      if (response.data.length > 0) setSelectedTurfIds([response.data[0]._id]);
    } catch (error) {} finally { setLoading(false); }
  };

  const fetchSlotStatus = async () => {
    setFetchingSlots(true);
    try {
      // For multi-turf, we check slots for the FIRST selected turf mainly, 
      // but in a real system we'd check all. We'll stick to the primary selection for now.
      const response = await api.get('slots-status', {
        params: { turfId: selectedTurfIds[0], date: selectedDateValue }
      });
      setSlots(response.data);
    } catch (error) {} finally { setFetchingSlots(false); }
  };

  const fetchMyBookings = async () => {
      try {
          const response = await api.get('bookings');
          setMyBookings(response.data.slice(0, 5));
      } catch (error) {}
  };

  const toggleTurf = (id: string) => {
      if (selectedTurfIds.includes(id)) {
          setSelectedTurfIds(selectedTurfIds.filter(tid => tid !== id));
      } else {
          setSelectedTurfIds([...selectedTurfIds, id]);
      }
  };

  const handleBookingStart = () => {
      if (selectedTurfIds.length === 0 || !selectedSlot) {
          Alert.alert("Error", "Please select at least one turf and a slot");
          return;
      }

      if (paymentMethod === 'online') {
          setShowPaymentModal(true);
      } else {
          executeBookings("cash");
      }
  };

  const executeBookings = async (method: string) => {
    try {
      for (const tId of selectedTurfIds) {
          const turf = turfs.find(t => t._id === tId);
          await api.post('add-booking', {
            turfId: tId,
            date: selectedDateValue,
            timeSlot: selectedSlot,
            playerName: user?.name || "Guest",
            phone: user?.mobile || "",
            amount: turf.pricePerHour,
            paymentMethod: method
          });
      }
      Alert.alert("Success", `Booking confirmed for ${selectedTurfIds.length} turf(s)!`);
      setSelectedSlot("");
      setShowPaymentModal(false);
      fetchSlotStatus();
      fetchMyBookings();
    } catch (error) {
      Alert.alert("Booking Failed", "Check your internet and try again.");
    }
  };

  const handleCancel = async (id: string) => {
    try {
        await api.post('cancel-booking', { bookingId: id });
        Alert.alert("Success", "Booking cancelled");
        fetchMyBookings();
        fetchSlotStatus();
    } catch (error: any) {
        Alert.alert("Error", error.response?.data?.error || "Cannot cancel booking");
    }
  };

  const totalAmount = selectedTurfIds.reduce((sum, tid) => {
      const t = turfs.find(turf => turf._id === tid);
      return sum + (t?.pricePerHour || 0);
  }, 0);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.header}>Book a Turf</Text>
      
      <Text style={styles.sectionTitle}>1. Select Turfs (You can pick more than one)</Text>
      <FlatList
        horizontal
        data={turfs}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }: any) => {
          const isSelected = selectedTurfIds.includes(item._id);
          return (
            <TouchableOpacity 
              style={[styles.turfCard, isSelected && styles.selected]} 
              onPress={() => toggleTurf(item._id)}
            >
              <Text style={styles.turfName}>{item.name}</Text>
              <Text style={styles.turfLocation}>📍 {item.location || "City Center"}</Text>
              <Text style={styles.turfPrice}>Rs. {item.pricePerHour}/hr</Text>
              {isSelected && <Text style={styles.selectedTag}>SELECTED</Text>}
            </TouchableOpacity>
          );
        }}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>2. Choose Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {DATES.map((d) => (
            <TouchableOpacity 
              key={d.value}
              style={[styles.dateChip, selectedDateValue === d.value && styles.selectedDateChip]}
              onPress={() => { setSelectedDateValue(d.value); setSelectedSlot(""); }}
            >
              <Text style={[styles.dateChipText, selectedDateValue === d.value && { color: '#fff' }]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.sectionTitle}>3. Available Slots</Text>
      {fetchingSlots ? (
        <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.slotsGrid}>
          {slots.map((item) => {
            const isUnavailable = item.status !== "available";
            return (
              <TouchableOpacity 
                key={item.slot} 
                disabled={isUnavailable}
                style={[styles.slot, selectedSlot === item.slot && styles.selectedSlot, isUnavailable && styles.unavailableSlot]}
                onPress={() => setSelectedSlot(item.slot)}
              >
                <Text style={[styles.slotText, selectedSlot === item.slot && { color: '#fff' }, isUnavailable && { color: '#94a3b8' }]}>{item.slot}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.sectionTitle}>4. Payment Method</Text>
      <View style={styles.paymentRow}>
          <TouchableOpacity style={[styles.paymentBtn, paymentMethod === 'cash' && styles.selectedPayment]} onPress={() => setPaymentMethod('cash')}>
              <Text style={[styles.paymentText, paymentMethod === 'cash' && { color: '#fff' }]}>Onsite Cash</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.paymentBtn, paymentMethod === 'online' && styles.selectedPayment]} onPress={() => setPaymentMethod('online')}>
              <Text style={[styles.paymentText, paymentMethod === 'online' && { color: '#fff' }]}>Online Card</Text>
          </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.bookButton, (!selectedSlot || selectedTurfIds.length === 0) && { opacity: 0.5 }]} onPress={handleBookingStart}>
        <Text style={styles.bookButtonText}>Book Now (Total: Rs. {totalAmount})</Text>
      </TouchableOpacity>

      {/* RECENT BOOKINGS */}
      {myBookings.length > 0 && (
          <View style={{ marginTop: 30 }}>
              <Text style={styles.sectionTitle}>Your History</Text>
              {myBookings.map((b) => (
                  <View key={b._id} style={styles.miniBookingCard}>
                      <View>
                        <Text style={styles.miniText}>📅 {b.date} | ⏰ {b.timeSlot}</Text>
                        <Text style={{ fontSize: 10, color: b.status === 'paid' ? 'green' : (b.status === 'pending' ? 'orange' : 'gray') }}>
                            {b.status === 'paid' ? '✅ Paid' : (b.status === 'pending' ? '⏳ Onsite Payment' : b.status)}
                        </Text>
                      </View>
                      {['paid', 'pending', 'confirmed'].includes(b.status) && (
                          <TouchableOpacity onPress={() => handleCancel(b._id)} style={styles.tinyCancelBtn}>
                              <Text style={{ color: '#ef4444', fontSize: 12 }}>Cancel</Text>
                          </TouchableOpacity>
                      )}
                  </View>
              ))}
          </View>
      )}

      <Modal visible={showPaymentModal} animationType="slide" transparent>
          <View style={styles.modalBg}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Online Payment Portal</Text>
                  <Text style={styles.modalAmount}>Total Due: Rs. {totalAmount}</Text>
                  
                  <Text style={styles.modalLabel}>Card Number</Text>
                  <TextInput style={styles.modalInput} placeholder="XXXX XXXX XXXX XXXX" keyboardType="numeric" value={cardNumber} onChangeText={setCardNumber} />
                  
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalLabel}>Expiry</Text>
                        <TextInput style={styles.modalInput} placeholder="MM/YY" value={cardExpiry} onChangeText={setCardExpiry} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalLabel}>CVV</Text>
                        <TextInput style={styles.modalInput} placeholder="123" secureTextEntry keyboardType="numeric" />
                      </View>
                  </View>

                  <TouchableOpacity style={styles.payBtn} onPress={() => executeBookings("online")}>
                      <Text style={styles.payBtnText}>Pay & Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                      <Text style={styles.closeModal}>Cancel</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginVertical: 15, color: '#64748b' },
  turfCard: { 
    backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginRight: 10, 
    borderWidth: 1, borderColor: '#e2e8f0', minWidth: 160, position: 'relative'
  },
  selected: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  turfName: { fontWeight: 'bold', fontSize: 15, color: '#1e293b' },
  turfLocation: { fontSize: 11, color: '#64748b', marginTop: 2 },
  turfPrice: { color: '#2563eb', marginTop: 10, fontSize: 14, fontWeight: 'bold' },
  selectedTag: { fontSize: 8, color: '#2563eb', fontWeight: 'bold', position: 'absolute', top: 10, right: 10 },
  dateSection: { marginTop: 10 },
  dateScroll: { flexDirection: 'row' },
  dateChip: {
    paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#f1f5f9', 
    borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0'
  },
  selectedDateChip: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  dateChipText: { fontSize: 12, fontWeight: '500', color: '#334155' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  slot: { padding: 10, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, width: '31%', alignItems: 'center' },
  selectedSlot: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  unavailableSlot: { backgroundColor: '#f8fafc', opacity: 0.6 },
  slotText: { fontSize: 10, color: '#334155', fontWeight: '600' },
  paymentRow: { flexDirection: 'row', gap: 10 },
  paymentBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  selectedPayment: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  paymentText: { fontSize: 13, fontWeight: 'bold', color: '#475569' },
  bookButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  miniBookingCard: { 
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      padding: 12, backgroundColor: '#f8fafc', borderRadius: 10, marginBottom: 8,
      borderWidth: 1, borderColor: '#e2e8f0'
  },
  miniText: { fontSize: 12, color: '#1e293b' },
  tinyCancelBtn: { padding: 8, backgroundColor: '#fee2e2', borderRadius: 6 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 30 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  modalAmount: { fontSize: 16, color: '#2563eb', fontWeight: 'bold', marginBottom: 20 },
  modalLabel: { fontSize: 12, color: '#64748b', marginBottom: 5 },
  modalInput: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, marginBottom: 15 },
  payBtn: { backgroundColor: '#10b981', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  closeModal: { textAlign: 'center', marginTop: 15, color: '#94a3b8' }
});