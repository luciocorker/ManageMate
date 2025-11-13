import { FavoriteItem, FavoritesFilter, SortConfig } from '@/types/favorites';
import { getMockFavorites } from '@/utils/mock-favorites';
import { useEffect, useMemo, useState } from 'react';

/**
 * Custom hook to manage favorites data and operations
 * Separates business logic from UI components
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FavoritesFilter>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    order: 'asc',
  });

  // Simulate API fetch - replace with actual API call
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        const data = getMockFavorites();
        setFavorites(data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Filter and sort favorites based on current filter and sort state
  const filteredAndSortedFavorites = useMemo(() => {
    // First, filter the favorites
    let result = favorites.filter(item => {
      // Filter by type
      if (filter.type && item.type !== filter.type) {
        return false;
      }

      // Filter by status
      if (filter.status && item.status !== filter.status) {
        return false;
      }

      // Filter by search query
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        );
      }

      return true;
    });

    // Then, sort the filtered results
    result = [...result].sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case 'name':
          // Sort alphabetically by name
          comparison = a.name.localeCompare(b.name);
          break;

        case 'date':
          // Sort by last updated date
          comparison = a.lastUpdated.getTime() - b.lastUpdated.getTime();
          break;

        case 'progress':
          // Sort by progress (items without progress go to end)
          const progressA = a.progress ?? -1;
          const progressB = b.progress ?? -1;
          comparison = progressA - progressB;
          break;

        default:
          comparison = 0;
      }

      // Apply sort order (ascending or descending)
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [favorites, filter, sortConfig]);

  /**
   * Remove item from favorites
   * In production, this would call an API endpoint
   */
  const removeFromFavorites = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      setFavorites(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  };

  /**
   * Update filter state
   */
  const updateFilter = (newFilter: Partial<FavoritesFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilter({});
  };

  /**
   * Update sort configuration
   */
  const updateSort = (newSort: Partial<SortConfig>) => {
    setSortConfig(prev => ({ ...prev, ...newSort }));
  };

  /**
   * Toggle sort order for a given field
   * If clicking the same field, toggle between asc/desc
   * If clicking a new field, default to asc
   */
  const toggleSort = (field: SortConfig['field']) => {
    setSortConfig(prev => {
      if (prev.field === field) {
        // Toggle order if same field
        return { field, order: prev.order === 'asc' ? 'desc' : 'asc' };
      } else {
        // Default to ascending for new field
        return { field, order: 'asc' };
      }
    });
  };

  return {
    favorites: filteredAndSortedFavorites,
    loading,
    filter,
    sortConfig,
    updateFilter,
    clearFilters,
    updateSort,
    toggleSort,
    removeFromFavorites,
    totalCount: favorites.length,
    filteredCount: filteredAndSortedFavorites.length,
  };
}
