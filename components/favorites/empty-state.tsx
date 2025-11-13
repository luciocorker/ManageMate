import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EmptyStateProps {
  hasFilters: boolean;
}

/**
 * Empty state component shown when no favorites are available
 * Different messages for filtered vs. no favorites at all
 */
export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconSymbol
          name={hasFilters ? 'magnifyingglass' : 'star'}
          size={64}
          color="#d1d5db"
        />
      </View>
      <Text style={styles.title}>
        {hasFilters ? 'No matches found' : 'You have no favorites yet'}
      </Text>
      <Text style={styles.description}>
        {hasFilters
          ? 'Try adjusting your search or filters'
          : 'Start adding projects, clients, or tasks to your favorites for quick access'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },
});
