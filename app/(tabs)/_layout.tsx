import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { display: 'none' },
      headerShown: true,
      headerTitleAlign: 'center',
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Notes',
          headerShadowVisible: false,
        }}
      />
    </Tabs>
  );
}
