// Type definitions for favorites feature

export type FavoriteType = 'Project' | 'Client' | 'Task';

export type SortField = 'name' | 'date' | 'progress';
export type SortOrder = 'asc' | 'desc';

export interface FavoriteItem {
  id: string;
  name: string;
  type: FavoriteType;
  description: string;
  progress?: number; // 0-100 for projects/tasks
  status: 'active' | 'completed' | 'pending' | 'on-hold';
  lastUpdated: Date;
  metadata?: {
    clientName?: string;
    dueDate?: Date;
    priority?: 'low' | 'medium' | 'high';
  };
}

export interface FavoritesFilter {
  type?: FavoriteType;
  status?: FavoriteItem['status'];
  searchQuery?: string;
}

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}
