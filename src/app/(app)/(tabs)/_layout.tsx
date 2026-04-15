import { Tabs } from 'expo-router'
import { CalendarDays, Settings } from 'lucide-react-native'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.xs,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tours',
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Réglages',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
