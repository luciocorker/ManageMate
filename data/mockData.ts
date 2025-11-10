import { FavoriteProject, Project, Task } from '@/types/project';

export const mockTasks: Task[] = [
  { id: 1, projectId: 1, name: 'Design wireframes', deadline: '2025-11-15', priority: 'High', assignee: 'Alice', completed: true, createdAt: '2025-11-01' },
  { id: 2, projectId: 1, name: 'Setup project repository', deadline: '2025-11-16', priority: 'High', assignee: 'Bob', completed: true, createdAt: '2025-11-01' },
  { id: 3, projectId: 1, name: 'Implement authentication', deadline: '2025-11-20', priority: 'Critical', assignee: 'Charlie', completed: false, createdAt: '2025-11-01' },
  { id: 4, projectId: 1, name: 'Create database schema', deadline: '2025-11-18', priority: 'High', assignee: 'Alice', completed: true, createdAt: '2025-11-02' },
  { id: 5, projectId: 1, name: 'Build UI components', deadline: '2025-11-25', priority: 'Medium', assignee: 'Bob', completed: false, createdAt: '2025-11-02' },
  
  { id: 6, projectId: 2, name: 'Research competitors', deadline: '2025-11-12', priority: 'Medium', assignee: 'Diana', completed: true, createdAt: '2025-11-03' },
  { id: 7, projectId: 2, name: 'Create marketing plan', deadline: '2025-11-20', priority: 'High', assignee: 'Eve', completed: false, createdAt: '2025-11-03' },
  { id: 8, projectId: 2, name: 'Design landing page', deadline: '2025-11-18', priority: 'High', assignee: 'Frank', completed: false, createdAt: '2025-11-04' },
  
  { id: 9, projectId: 3, name: 'Fix login bug', deadline: '2025-11-11', priority: 'Critical', assignee: 'Grace', completed: true, createdAt: '2025-11-05' },
  { id: 10, projectId: 3, name: 'Update dependencies', deadline: '2025-11-12', priority: 'Medium', assignee: 'Henry', completed: true, createdAt: '2025-11-05' },
  { id: 11, projectId: 3, name: 'Performance optimization', deadline: '2025-11-15', priority: 'High', assignee: 'Grace', completed: false, createdAt: '2025-11-06' },
  
  { id: 12, projectId: 4, name: 'Define project scope', deadline: '2025-11-14', priority: 'High', assignee: 'Ivan', completed: false, createdAt: '2025-11-07' },
  { id: 13, projectId: 4, name: 'Create timeline', deadline: '2025-11-16', priority: 'Medium', assignee: 'Jane', completed: false, createdAt: '2025-11-07' },
  
  { id: 14, projectId: 5, name: 'Code review', deadline: '2025-11-13', priority: 'High', assignee: 'Kate', completed: true, createdAt: '2025-11-08' },
  { id: 15, projectId: 5, name: 'Write documentation', deadline: '2025-11-14', priority: 'Medium', assignee: 'Leo', completed: true, createdAt: '2025-11-08' },
  { id: 16, projectId: 5, name: 'Deploy to staging', deadline: '2025-11-15', priority: 'High', assignee: 'Kate', completed: false, createdAt: '2025-11-09' },
];

export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'E-Commerce Platform',
    description: 'Building a modern e-commerce platform with React and Node.js',
    status: 'In Progress',
    priority: 'High',
    progress: 60,
    deadline: '2025-12-01',
    budget: 50000,
    color: '#3b82f6',
    team: ['Alice', 'Bob', 'Charlie'],
    createdAt: '2025-11-01',
    updatedAt: '2025-11-10',
  },
  {
    id: 2,
    name: 'Marketing Campaign',
    description: 'Q4 marketing campaign for product launch',
    status: 'Planning',
    priority: 'Medium',
    progress: 25,
    deadline: '2025-11-30',
    budget: 15000,
    color: '#10b981',
    team: ['Diana', 'Eve', 'Frank'],
    createdAt: '2025-11-03',
    updatedAt: '2025-11-09',
  },
  {
    id: 3,
    name: 'Bug Fixes Sprint',
    description: 'Critical bug fixes and performance improvements',
    status: 'Review',
    priority: 'Critical',
    progress: 75,
    deadline: '2025-11-15',
    budget: 5000,
    color: '#ef4444',
    team: ['Grace', 'Henry'],
    createdAt: '2025-11-05',
    updatedAt: '2025-11-10',
  },
  {
    id: 4,
    name: 'Mobile App Development',
    description: 'Native mobile app for iOS and Android',
    status: 'Planning',
    priority: 'High',
    progress: 10,
    deadline: '2026-02-01',
    budget: 80000,
    color: '#8b5cf6',
    team: ['Ivan', 'Jane', 'Kate', 'Leo'],
    createdAt: '2025-11-07',
    updatedAt: '2025-11-09',
  },
  {
    id: 5,
    name: 'API Integration',
    description: 'Integrate third-party APIs for payment and analytics',
    status: 'Testing',
    priority: 'High',
    progress: 85,
    deadline: '2025-11-20',
    budget: 12000,
    color: '#f59e0b',
    team: ['Kate', 'Leo'],
    createdAt: '2025-11-08',
    updatedAt: '2025-11-10',
  },
  {
    id: 6,
    name: 'Database Migration',
    description: 'Migrate from MongoDB to PostgreSQL',
    status: 'Completed',
    priority: 'Medium',
    progress: 100,
    deadline: '2025-11-05',
    budget: 8000,
    color: '#06b6d4',
    team: ['Alice', 'Henry'],
    createdAt: '2025-10-15',
    updatedAt: '2025-11-05',
  },
  {
    id: 7,
    name: 'Customer Portal',
    description: 'Self-service customer portal with ticket system',
    status: 'Paused',
    priority: 'Low',
    progress: 40,
    deadline: '2026-01-15',
    budget: 25000,
    color: '#64748b',
    team: ['Bob', 'Diana', 'Frank'],
    createdAt: '2025-10-20',
    updatedAt: '2025-11-01',
  },
  {
    id: 8,
    name: 'Old Website Redesign',
    description: 'Complete redesign of legacy website',
    status: 'Archived',
    priority: 'Low',
    progress: 100,
    deadline: '2025-09-30',
    budget: 20000,
    color: '#6b7280',
    team: ['Eve'],
    createdAt: '2025-08-01',
    updatedAt: '2025-10-01',
  },
];

export const mockFavorites: FavoriteProject[] = [
  { id: 1, projectId: 1, createdAt: '2025-11-05' },
  { id: 2, projectId: 3, createdAt: '2025-11-06' },
  { id: 3, projectId: 5, createdAt: '2025-11-09' },
];

// Helper function to get projects with tasks
export function getProjectsWithTasks(): Project[] {
  return mockProjects.map(project => ({
    ...project,
    tasks: mockTasks.filter(task => task.projectId === project.id),
    isFavorite: mockFavorites.some(fav => fav.projectId === project.id),
  }));
}

// Helper function to calculate progress from tasks
export function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.completed).length;
  return Math.round((completedTasks / tasks.length) * 100);
}
