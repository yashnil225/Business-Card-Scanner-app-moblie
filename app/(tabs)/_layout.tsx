import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'

import { useColors } from '@/src/hooks/useColors'

export default function TabLayout() {
  const colors = useColors()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarAccessibilityLabel: 'Main navigation',
      }}
      // Contacts is the default tab that opens first
      initialRouteName="contacts"
    >
      {/* Dashboard tab - first in order but not default */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Dashboard tab',
        }}
      />
      {/* Contacts tab - default tab that opens first */}
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Contacts tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen
        name="contact-detail"
        options={{
          title: 'Contact Details',
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          title: 'Edit Profile',
          href: null,
        }}
      />
    </Tabs>
  )
}
