import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export interface Note {
  id: string; // UUID string
  content: string;
  date: string;
}

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    loadNotes();
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
    const preview = item.content.split('\n')[0].slice(0, 50) + (item.content.length > 50 ? '...' : '');
    const date = new Date(item.date).toLocaleDateString();

    return (
      <TouchableOpacity 
        style={styles.noteItem}
        onPress={() => router.push(`/note/${item.id}`)}
      >
        <ThemedText style={styles.notePreview}>{preview}</ThemedText>
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
  notePreview: {
    fontSize: 16,
    marginBottom: 4,
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
