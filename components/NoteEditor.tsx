import { useState, useEffect } from "react";
import { eventEmitter } from "../utils/events";
import { v4 as uuidv4 } from 'uuid';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { getClaudeResponse } from "../utils/claude";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { router } from "expo-router";

import { Note } from "../app/(tabs)";

interface Props {
  initialNote?: Note;
}

export default function NoteEditor({ initialNote }: Props) {
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (initialNote?.content) {
      setNote(initialNote.content);
    }
  }, [initialNote?.content]);

  const saveNote = async () => {
    if (note.trim()) {
      try {
        const timestamp = new Date().toISOString();
        const newNote = {
          id: initialNote?.id || uuidv4(),
          content: note,
          date: timestamp,
        };

        // Get existing notes
        const existingNotesJson = await AsyncStorage.getItem("notes");
        const existingNotes: Note[] = existingNotesJson
          ? JSON.parse(existingNotesJson)
          : [];

        if (initialNote) {
          // Update existing note
          const updatedNotes = existingNotes.map((n) =>
            n.id === initialNote.id ? newNote : n,
          );
          await AsyncStorage.setItem("notes", JSON.stringify(updatedNotes));
        } else {
          // Add new note to the beginning
          const updatedNotes = [newNote, ...existingNotes];
          await AsyncStorage.setItem("notes", JSON.stringify(updatedNotes));
        }

        // Emit event and go back to list
        eventEmitter.emit('notesUpdated');
        router.back();
      } catch (error) {
        console.error("Error saving note:", error);
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                setNote(
                  (prev) =>
                    `${prev}\n\nClaude's response:\n${response}\n\n---\n`,
                );
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
  },
  keyboardView: {
    flex: 1,
    width: "100%",
  },
  input: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    minHeight: 200,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  askClaudeButton: {
    backgroundColor: "#5A45FF",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});