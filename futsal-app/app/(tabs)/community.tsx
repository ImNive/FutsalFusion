import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadUser();
    fetchPosts();
  }, []);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) setCurrentUser(JSON.parse(userData));
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get('posts');
      setPosts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
      Alert.alert(
          "Delete Post",
          "Are you sure you want to remove this message?",
          [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: async () => {
                  try {
                      await api.delete(`posts/${postId}`);
                      fetchPosts();
                  } catch (err) {
                      Alert.alert("Error", "Could not delete post");
                  }
              }}
          ]
      );
  };

  const renderItem = ({ item }: any) => {
    const isAuthor = currentUser && item.authorId?._id === currentUser.id;

    return (
        <View style={styles.postCard}>
        <View style={styles.postHeader}>
            <View>
                <Text style={styles.author}>{item.authorId?.name || 'Anonymous'}</Text>
                <Text style={styles.footerText}>{item.date} at {item.time}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.typeTag}>{item.type === 'player_availability' ? 'Available' : 'Needed'}</Text>
                {isAuthor && (
                    <TouchableOpacity onPress={() => handleDeletePost(item._id)} style={{ marginTop: 5 }}>
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: 'bold' }}>Delete</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
        <Text style={styles.content}>{item.content}</Text>
        <View style={styles.postFooter}>
            <Text style={styles.footerText}>📍 {item.location}</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>Community Board</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/create-post' as any)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchPosts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  addButton: { backgroundColor: '#2563eb', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  addButtonText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  postCard: { backgroundColor: '#fff', padding: 18, borderRadius: 16, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  author: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
  typeTag: { backgroundColor: '#e0f2fe', color: '#0369a1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: 'bold', overflow: 'hidden' },
  content: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 12 },
  postFooter: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  footerText: { fontSize: 12, color: '#94a3b8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
