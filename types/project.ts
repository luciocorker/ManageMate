export type ProjectStatus = 
  | 'Planning' 
  | 'In Progress' 
  | 'Review' 
  | 'Testing' 
  | 'Completed' 
  | 'Paused' 
  | 'Archived';

export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id: number;
  projectId: number;
  name: string;
  deadline?: string;
  priority: TaskPriority;
  assignee?: string;
  completed: boolean;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  deadline?: string;
  budget?: number;
  color: string;
  team: string[];
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  isFavorite?: boolean;
}

export interface FavoriteProject {
  id: number;
  projectId: number;
  createdAt: string;
}
