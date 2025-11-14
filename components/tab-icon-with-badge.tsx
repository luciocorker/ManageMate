import { SymbolViewProps } from 'expo-symbols';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

interface TabIconWithBadgeProps {
  name: SymbolViewProps['name'];
  color: string;
  size?: number;
  badgeCount?: number;
}

export function TabIconWithBadge({ name, color, size = 28, badgeCount = 0 }: TabIconWithBadgeProps) {
  return (
    <View style={styles.container}>
      <IconSymbol size={size} name={name} color={color} />
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});
