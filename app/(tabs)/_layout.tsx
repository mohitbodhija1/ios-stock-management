import { Tabs } from 'expo-router';
import React from 'react';
import { ArrowLeftRight, BarChart3, Boxes, Building2, LayoutDashboard } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scheme = isDark ? 'dark' : 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1473e6',
        tabBarInactiveTintColor: Colors[scheme].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarStyle: {
          height: 76,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopColor: isDark ? '#233042' : '#e5e5ea',
          borderTopWidth: 1,
          elevation: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => <Boxes size={20} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="godowns"
        options={{
          title: 'Godowns',
          tabBarIcon: ({ color }) => <Building2 size={20} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: 'Stock',
          tabBarIcon: ({ color }) => <BarChart3 size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="movements"
        options={{
          title: 'Moves',
          tabBarIcon: ({ color }) => <ArrowLeftRight size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
