import { useEffect, useState } from 'react';
import { eventEmitter } from '../../utils/events';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export interface Note {
  id: string; // UUID string
  title: string;
  content: string;
  date: string;
}

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    loadNotes();
    
    // Subscribe to notes updates
    const unsubscribe = eventEmitter.subscribe('notesUpdated', loadNotes);
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const loadNotes = async () => {
    try {
      const notesJson = await AsyncStorage.getItem('notes');
      if (notesJson) {
        setNotes(JSON.parse(notesJson));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const renderNote = ({ item }: { item: Note }) => {
    const date = new Date(item.date).toLocaleDateString();

    return (
      <TouchableOpacity 
        style={styles.noteItem}
        onPress={() => router.push(`/note/${item.id}`)}
      >
        <ThemedText style={styles.noteTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.notePreview} numberOfLines={2}>
          {item.content}
        </ThemedText>
        <ThemedText style={styles.noteDate}>{date}</ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={item => item.id}
        style={styles.list}
      />
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/note/new')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  noteItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
