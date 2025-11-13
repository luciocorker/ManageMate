import { IconSymbol } from '@/components/ui/icon-symbol';
import { FavoriteType, FavoritesFilter } from '@/types/favorites';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface SearchFilterBarProps {
  filter: FavoritesFilter;
  onFilterChange: (filter: Partial<FavoritesFilter>) => void;
  onClearFilters: () => void;
}

/**
 * Search and filter component for favorites
 * Allows users to search by name/description and filter by type
 */
export function SearchFilterBar({
  filter,
  onFilterChange,
  onClearFilters,
}: SearchFilterBarProps) {
  const [searchText, setSearchText] = useState(filter.searchQuery || '');

  const types: (FavoriteType | 'All')[] = ['All', 'Project', 'Client', 'Task'];

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    onFilterChange({ searchQuery: text || undefined });
  };

  const handleTypeFilter = (type: FavoriteType | 'All') => {
    onFilterChange({ type: type === 'All' ? undefined : type });
  };

  const hasActiveFilters = filter.type || filter.searchQuery;

  return (
    <View style={styles.container}>
      {/* Search input */}
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={18} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search favorites..."
          value={searchText}
          onChangeText={handleSearchChange}
          placeholderTextColor="#9ca3af"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearchChange('')}>
            <IconSymbol name="xmark.circle.fill" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Type filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {types.map(type => {
          const isActive = type === 'All' ? !filter.type : filter.type === type;
          return (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => handleTypeFilter(type)}
            >
              <Text
                style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Clear filters button */}
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearButton} onPress={onClearFilters}>
            <IconSymbol name="arrow.counterclockwise" size={14} color="#ef4444" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
  },
  filterScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  filterChipActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a1a1a',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});
