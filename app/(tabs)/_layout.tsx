import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { display: 'none' },
      headerShown: true,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Notes',
        }}
      />
    </Tabs>
  );
}
