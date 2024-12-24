import { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [temperature, setTemperature] = useState(0.7);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTemp = await AsyncStorage.getItem('claude_temperature');
      if (savedTemp) {
        setTemperature(parseFloat(savedTemp));
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
});
