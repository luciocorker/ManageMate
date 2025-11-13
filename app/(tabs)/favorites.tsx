import { EmptyState } from '@/components/favorites/empty-state';
import { FavoriteCard } from '@/components/favorites/favorite-card';
import { LoadingSkeleton } from '@/components/favorites/loading-skeleton';
import { SearchFilterBar } from '@/components/favorites/search-filter-bar';
import { SortDropdown } from '@/components/favorites/sort-dropdown';
import { ThemedView } from '@/components/themed-view';
import { useFavorites } from '@/hooks/use-favorites';
import { FavoriteItem } from '@/types/favorites';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Favorites Screen Component
 * 
 * Main screen for displaying and managing favorite items (projects, clients, tasks)
 * Features:
 * - Search functionality
 * - Filter by type
 * - Sort by name, date, or progress (ascending/descending)
 * - Remove from favorites
 * - View details
 * - Loading and empty states
 * 
 * Architecture:
 * - Business logic separated into useFavorites hook
 * - UI components modularized for reusability
 * - Mock data used for demonstration (replace with API calls)
 */
export default function FavoritesScreen() {
  const {
    favorites,
    loading,
    filter,
    sortConfig,
    updateFilter,
    clearFilters,
    toggleSort,
    removeFromFavorites,
    totalCount,
    filteredCount,
  } = useFavorites();

  /**
   * Handle removing an item from favorites
   */
  const handleRemove = async (id: string) => {
    const success = await removeFromFavorites(id);
    if (success) {
      Alert.alert('Success', 'Item removed from favorites');
    } else {
      Alert.alert('Error', 'Failed to remove item from favorites');
    }
  };

  /**
   * Handle viewing item details
   * In production, this would navigate to a detail screen
   */
  const handleViewDetails = (item: FavoriteItem) => {
    Alert.alert(
      item.name,
      `Type: ${item.type}\nStatus: ${item.status}\n\n${item.description}`,
      [{ text: 'OK' }]
    );
  };

  const hasActiveFilters = !!(filter.type || filter.searchQuery);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>
          {loading
            ? 'Loading...'
            : `${filteredCount} of ${totalCount} ${totalCount === 1 ? 'item' : 'items'}`}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Search and filter bar */}
        {!loading && totalCount > 0 && (
          <>
            <SearchFilterBar
              filter={filter}
              onFilterChange={updateFilter}
              onClearFilters={clearFilters}
            />
            
            {/* Sort dropdown */}
            <View style={styles.sortContainer}>
              <SortDropdown sortConfig={sortConfig} onSortChange={toggleSort} />
            </View>
          </>
        )}

        {/* Loading state */}
        {loading && <LoadingSkeleton />}

        {/* Empty state */}
        {!loading && filteredCount === 0 && (
          <EmptyState hasFilters={hasActiveFilters} />
        )}

        {/* Favorites list */}
        {!loading && filteredCount > 0 && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {favorites.map(item => (
              <FavoriteCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onViewDetails={handleViewDetails}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sortContainer: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  listContent: {
    paddingBottom: 20,
  },
});
