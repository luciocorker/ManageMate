import { FavoriteItem } from '@/types/favorites';

/**
 * Mock data generator for favorites
 * Replace this with actual API calls in production
 */
export function getMockFavorites(): FavoriteItem[] {
  return [
    {
      id: '1',
      name: 'Website Redesign',
      type: 'Project',
      description: 'Complete overhaul of company website with modern design',
      progress: 65,
      status: 'active',
      lastUpdated: new Date('2024-11-08'),
      metadata: {
        clientName: 'Acme Corp',
        dueDate: new Date('2024-12-15'),
        priority: 'high',
      },
    },
    {
      id: '2',
      name: 'TechStart Inc.',
      type: 'Client',
      description: 'Leading technology startup in AI solutions',
      status: 'active',
      lastUpdated: new Date('2024-11-09'),
      metadata: {
        priority: 'high',
      },
    },
    {
      id: '3',
      name: 'API Documentation',
      type: 'Task',
      description: 'Write comprehensive API documentation for v2.0',
      progress: 40,
      status: 'pending',
      lastUpdated: new Date('2024-11-07'),
      metadata: {
        dueDate: new Date('2024-11-20'),
        priority: 'medium',
      },
    },
    {
      id: '4',
      name: 'Mobile App Development',
      type: 'Project',
      description: 'Cross-platform mobile app for iOS and Android',
      progress: 85,
      status: 'active',
      lastUpdated: new Date('2024-11-10'),
      metadata: {
        clientName: 'StartupXYZ',
        dueDate: new Date('2024-11-30'),
        priority: 'high',
      },
    },
    {
      id: '5',
      name: 'Code Review',
      type: 'Task',
      description: 'Review pull requests for authentication module',
      progress: 100,
      status: 'completed',
      lastUpdated: new Date('2024-11-06'),
      metadata: {
        priority: 'low',
      },
    },
    {
      id: '6',
      name: 'Global Solutions Ltd',
      type: 'Client',
      description: 'International consulting firm specializing in digital transformation',
      status: 'active',
      lastUpdated: new Date('2024-11-05'),
      metadata: {
        priority: 'medium',
      },
    },
  ];
}
