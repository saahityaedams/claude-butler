import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, View } from 'react-native';
import { getClaudeResponse } from '../../utils/claude';
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
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TextInput
          style={styles.input}
          multiline
          placeholder="Write your note here..."
          value={note}
          onChangeText={setNote}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]}
            onPress={saveNote}
          >
            <ThemedText style={styles.buttonText}>Save Note</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.askClaudeButton]}
            onPress={async () => {
              if (note.trim()) {
                const response = await getClaudeResponse(note);
                setNote(prev => `${prev}\n\nClaude's response:\n${response}\n\n---\n`);
              }
            }}
          >
            <ThemedText style={styles.buttonText}>Ask Claude</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  input: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    minHeight: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  askClaudeButton: {
    backgroundColor: '#5A45FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
