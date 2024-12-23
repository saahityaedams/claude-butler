import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

export default function NotesScreen() {
  const [note, setNote] = useState('');

  const saveNote = async () => {
    if (note.trim()) {
      try {
        const timestamp = new Date().toISOString();
        const newNote = {
          id: timestamp,
          content: note,
          date: timestamp
        };
        
        // Get existing notes
        const existingNotesJson = await AsyncStorage.getItem('notes');
        const existingNotes = existingNotesJson ? JSON.parse(existingNotesJson) : [];
        
        // Add new note to the beginning
        const updatedNotes = [newNote, ...existingNotes];
        
        // Save back to storage
        await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
        
        // Clear input
        setNote('');
      } catch (error) {
        console.error('Error saving note:', error);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ThemedView style={styles.container}>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Write your note here..."
          value={note}
          onChangeText={setNote}
        />
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveNote}
        >
          <ThemedText style={styles.saveButtonText}>Save Note</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
