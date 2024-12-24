import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Switch, TextInput } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [temperature, setTemperature] = useState(0.7);
  const [systemPromptEnabled, setSystemPromptEnabled] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTemp = await AsyncStorage.getItem('claude_temperature');
      const savedSystemPromptEnabled = await AsyncStorage.getItem('system_prompt_enabled');
      const savedSystemPrompt = await AsyncStorage.getItem('system_prompt');
      
      if (savedTemp) {
        setTemperature(parseFloat(savedTemp));
      }
      if (savedSystemPromptEnabled) {
        setSystemPromptEnabled(savedSystemPromptEnabled === 'true');
      }
      if (savedSystemPrompt) {
        setSystemPrompt(savedSystemPrompt);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveTemperature = async (value: number) => {
    try {
      await AsyncStorage.setItem('claude_temperature', value.toString());
      setTemperature(value);
    } catch (error) {
      console.error('Error saving temperature:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
      </View>
      <View style={styles.setting}>
        <ThemedText style={styles.label}>Claude Temperature: {temperature.toFixed(2)}</ThemedText>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={temperature}
          onValueChange={saveTemperature}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#000000"
        />
      </View>

      <View style={styles.setting}>
        <View style={styles.settingHeader}>
          <ThemedText style={styles.label}>System Prompt</ThemedText>
          <Switch
            value={systemPromptEnabled}
            onValueChange={async (value) => {
              setSystemPromptEnabled(value);
              await AsyncStorage.setItem('system_prompt_enabled', value.toString());
            }}
          />
        </View>
        {systemPromptEnabled && (
          <TextInput
            style={styles.promptInput}
            multiline
            placeholder="Enter system prompt..."
            value={systemPrompt}
            onChangeText={async (text) => {
              setSystemPrompt(text);
              await AsyncStorage.setItem('system_prompt', text);
            }}
          />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  setting: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
});
