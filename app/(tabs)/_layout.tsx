import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { ArrowLeftRight, BarChart3, Boxes, Building2, LayoutDashboard } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  // Locked to Professional Light Palette
  const activeColor = '#0f172a';   // Deep Slate
  const inactiveColor = '#94a3b8'; // Muted Slate
  const borderColor = '#e2e8f0';   // Subtle Border

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        
        // Premium Light Blur Background
        tabBarBackground: () => (
          <BlurView
            tint="light"
            intensity={Platform.OS === 'ios' ? 90 : 100}
            style={StyleSheet.absoluteFill}
          />
        ),

        tabBarItemStyle: {
          paddingVertical: 8,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginTop: 2,
        },

        tabBarStyle: {
          position: 'absolute', 
          height: 88,
          borderTopWidth: 1, 
          borderTopColor: borderColor,
          elevation: 0,
          // Transparent on iOS to show blur, solid white fallback for others
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#ffffff',
          paddingBottom: 24,
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <LayoutDashboard size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="products"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ color, focused }) => (
            <Boxes size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="godowns"
        options={{
          title: 'Sites',
          tabBarIcon: ({ color, focused }) => (
            <Building2 size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="stock"
        options={{
          title: 'Stock',
          tabBarIcon: ({ color, focused }) => (
            <BarChart3 size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="movements"
        options={{
          title: 'Moves',
          tabBarIcon: ({ color, focused }) => (
            <ArrowLeftRight size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}