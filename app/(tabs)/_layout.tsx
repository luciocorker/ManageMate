import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  const toggleNavbar = () => {
    setIsNavbarVisible(!isNavbarVisible);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarShowLabel: false,
          tabBarStyle: isNavbarVisible ? undefined : { display: 'none' },
        }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="project"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messaging"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="star.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
    
    {!isNavbarVisible && (
      <TouchableOpacity 
        style={[
          styles.toggleButton,
          { backgroundColor: Colors[colorScheme ?? 'light'].background }
        ]} 
        onPress={toggleNavbar}
        activeOpacity={0.8}
      >
        <View style={[
          styles.toggleButtonInner,
          { 
            backgroundColor: Colors[colorScheme ?? 'light'].tint,
            borderColor: Colors[colorScheme ?? 'light'].background
          }
        ]}>
          <IconSymbol 
            size={24} 
            name='chevron.up' 
            color={colorScheme === 'dark' ? '#000' : '#fff'}
          />
        </View>
      </TouchableOpacity>
    )}
    
    {isNavbarVisible && (
      <TouchableOpacity 
        style={styles.hideButton} 
        onPress={toggleNavbar}
        activeOpacity={0.8}
      >
        <IconSymbol 
          size={20} 
          name='chevron.down' 
          color={Colors[colorScheme ?? 'light'].icon}
        />
      </TouchableOpacity>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  },
  toggleButtonInner: {
    width: 50,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  hideButton: {
    position: 'absolute',
    bottom: 85,
    alignSelf: 'center',
    width: 40,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});
