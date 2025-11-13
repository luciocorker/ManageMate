import { Project, ProjectFile, Task, TaskStatus } from '@/types/project';
import { supabase } from './supabase';

export interface ProjectWithTasks extends Project {
  tasks: Task[];
  teamMembers: string[];
}

/**
 * Fetch all projects with their tasks and team members for the current user
 */
export async function getProjectsWithTasks(): Promise<ProjectWithTasks[]> {
  try {
    // Fetch projects with tasks and team members (without auth check for testing)
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        tasks (*),
        project_members (member_name)
      `)
      .order('created_at', { ascending: false });

    if (projectsError) throw projectsError;

    // Transform the data to match the ProjectWithTasks interface
    return (projects || []).map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
      deadline: project.deadline,
      budget: project.budget,
      color: project.color,
      team: (project.project_members || []).map((member: any) => member.member_name),
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      tasks: (project.tasks || []).map((task: any) => ({
        id: task.id,
        projectId: project.id,
        name: task.name,
        deadline: task.deadline,
        priority: task.priority,
        assignee: task.assignee,
        status: task.status as TaskStatus,
        completed: task.completed,
        createdAt: task.created_at,
      })),
      teamMembers: (project.project_members || []).map((member: any) => member.member_name),
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

/**
 * Get a single project by ID
 */
export async function getProjectById(projectId: string): Promise<ProjectWithTasks | null> {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        tasks (*),
        project_members (member_name)
      `)
      .eq('id', projectId)
      .single();

    if (error) throw error;
    if (!project) return null;

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
      deadline: project.deadline,
      budget: project.budget,
      color: project.color,
      team: (project.project_members || []).map((member: any) => member.member_name),
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      tasks: (project.tasks || []).map((task: any) => ({
        id: task.id,
        projectId: project.id,
        name: task.name,
        deadline: task.deadline,
        priority: task.priority,
        assignee: task.assignee,
        status: task.status as TaskStatus,
        completed: task.completed,
        createdAt: task.created_at,
      })),
      teamMembers: (project.project_members || []).map((member: any) => member.member_name),
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

/**
 * Create a new project
 */
export async function createProject(projectData: {
  name: string;
  description: string;
  status: string;
  priority: string;
  deadline?: string;
  budget?: string;
  color?: string;
  teamMembers?: string[];
}): Promise<Project> {
  try {
    // Create the project (without auth check for testing)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        priority: projectData.priority,
        deadline: projectData.deadline || null,
        budget: projectData.budget ? parseFloat(projectData.budget) : null,
        color: projectData.color || '#3b82f6',
        owner_id: null, // Set to null since no user is authenticated
        progress: 0,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Add team members if provided
    if (projectData.teamMembers && projectData.teamMembers.length > 0) {
      const members = projectData.teamMembers.map((memberName) => ({
        project_id: project.id,
        member_name: memberName,
      }));

      const { error: membersError } = await supabase
        .from('project_members')
        .insert(members);

      if (membersError) throw membersError;
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
      deadline: project.deadline,
      budget: project.budget,
      color: project.color,
      team: [],
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

/**
 * Create a new task
 */
export async function createTask(
  projectId: string,
  taskData: {
    name: string;
    deadline?: string;
    priority: string;
    assignee?: string;
  }
): Promise<Task> {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        project_id: projectId,
        name: taskData.name,
        deadline: taskData.deadline || null,
        priority: taskData.priority,
        assignee: taskData.assignee || 'You',
        status: 'Not Started',
        completed: false,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: task.id,
      projectId: projectId,
      name: task.name,
      deadline: task.deadline,
      priority: task.priority,
      assignee: task.assignee,
      status: task.status as TaskStatus,
      completed: task.completed,
      createdAt: task.created_at,
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  completed: boolean
): Promise<void> {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ status, completed })
      .eq('id', taskId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

/**
 * Calculate and update project progress based on completed tasks
 */
export async function updateProjectProgress(projectId: string): Promise<void> {
  try {
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('completed')
      .eq('project_id', projectId);

    if (tasksError) throw tasksError;

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(task => task.completed).length || 0;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const { error: updateError } = await supabase
      .from('projects')
      .update({ progress })
      .eq('id', projectId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error updating project progress:', error);
    throw error;
  }
}

/**
 * Toggle favorite status for a project
 */
export async function toggleFavorite(projectId: string): Promise<boolean> {
  try {
    // For testing without auth, just return false (not favorited)
    // In production, this would check/update favorites table
    console.log('Toggle favorite called for project:', projectId);
    return false;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
}

/**
 * Get favorite project IDs for the current user
 */
export async function getFavoriteProjectIds(): Promise<string[]> {
  try {
    // For testing without auth, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

/**
 * Subscribe to real-time changes for a project
 */
export function subscribeToProject(
  projectId: string,
  callback: () => void
) {
  const channel = supabase
    .channel(`project-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to real-time changes for all projects
 */
export function subscribeToProjects(callback: () => void) {
  const channel = supabase
    .channel('projects')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Upload a file to Supabase Storage and save metadata
 */
export async function uploadFile(
  projectId: string,
  fileUri: string,
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<ProjectFile> {
  try {
    // Read file as base64
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    // Generate unique file path
    const fileExt = fileName.split('.').pop();
    const filePath = `${projectId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, arrayBuffer, {
        contentType: fileType,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Save file metadata to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('project_files')
      .insert({
        project_id: projectId,
        file_name: fileName,
        file_path: filePath,
        file_type: fileType,
        file_size: fileSize,
        uploaded_by: null, // Set to user ID when auth is implemented
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return {
      id: fileRecord.id,
      projectId: projectId,
      fileName: fileRecord.file_name,
      filePath: fileRecord.file_path,
      fileType: fileRecord.file_type,
      fileSize: fileRecord.file_size,
      uploadedBy: fileRecord.uploaded_by,
      createdAt: fileRecord.created_at,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Get all files for a project
 */
export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  try {
    const { data: files, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (files || []).map((file) => ({
      id: file.id,
      projectId: file.project_id,
      fileName: file.file_name,
      filePath: file.file_path,
      fileType: file.file_type,
      fileSize: file.file_size,
      uploadedBy: file.uploaded_by,
      createdAt: file.created_at,
    }));
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
}

/**
 * Download/Get file URL
 */
export async function getFileUrl(filePath: string): Promise<string> {
  try {
    const { data } = supabase.storage
      .from('project-files')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string, filePath: string): Promise<void> {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('project-files')
      .remove([filePath]);

    if (storageError) console.error('Storage delete error:', storageError);

    // Delete from database
    const { error: dbError } = await supabase
      .from('project_files')
      .delete()
      .eq('id', fileId);

    if (dbError) throw dbError;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}
