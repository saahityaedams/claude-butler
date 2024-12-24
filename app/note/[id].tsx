import { useLocalSearchParams, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import NoteEditor from '../../components/NoteEditor';

import { Note } from '../(tabs)';

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams();
  const { id } = useLocalSearchParams();
  const [note, setNote] = useState<Note | undefined>();

  useEffect(() => {
    if (id === 'new') return;
    
    const loadNote = async () => {
      try {
        const notesJson = await AsyncStorage.getItem('notes');
        if (notesJson) {
          const notes: Note[] = JSON.parse(notesJson);
          const foundNote = notes.find(n => n.id === id);
          setNote(foundNote);
        }
      } catch (error) {
        console.error('Error loading note:', error);
      }
    };

    loadNote();
  }, [id]);

  return (
    <>
      <Stack.Screen 
        options={{
          title: id === 'new' ? 'New Note' : note?.title || 'Edit Note',
        }} 
      />
      <NoteEditor initialNote={note} />
    </>
  );
}
