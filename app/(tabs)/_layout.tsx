import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#007AFF',
    }}>
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => <FontAwesome name="inbox" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="next-actions"
        options={{
          title: 'Next Actions',
          tabBarIcon: ({ color }) => <FontAwesome name="forward" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <FontAwesome name="folder" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="completed"
        options={{
          title: 'Completed',
          tabBarIcon: ({ color }) => <FontAwesome name="check" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
