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

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  projectId: string;
  name: string;
  deadline?: string;
  priority: TaskPriority;
  assignee?: string;
  status: TaskStatus;
  completed: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
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
  ownerId?: string;
}

export interface FavoriteProject {
  id: string;
  projectId: string;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
  uploadedBy?: string;
  createdAt: string;
}
