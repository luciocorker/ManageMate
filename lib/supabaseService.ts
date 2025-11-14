import { Project, ProjectFile, Task, TaskStatus } from '@/types/project';
import { supabase } from './supabase';

export interface ProjectWithTasks extends Project {
  tasks: Task[];
  teamMembers: string[];
}

/**
 * Get the current authenticated user
 */
async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

/**
 * Fetch all projects with their tasks and team members for the current user
 */
export async function getProjectsWithTasks(): Promise<ProjectWithTasks[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];
    
    // Fetch projects owned by the user
    const { data: ownedProjects, error: ownedError } = await supabase
      .from('projects')
      .select(`
        *,
        tasks (*),
        project_members (member_name)
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (ownedError) throw ownedError;

    // Fetch projects where user is a team member
    const { data: memberProjects, error: memberError } = await supabase
      .from('project_members')
      .select(`
        project_id,
        projects (
          *,
          tasks (*),
          project_members (member_name)
        )
      `)
      .eq('user_id', user.id);

    if (memberError) throw memberError;

    // Combine and deduplicate projects
    const allProjects = [...(ownedProjects || [])];
    const ownedProjectIds = new Set(ownedProjects?.map(p => p.id) || []);

    // Add member projects that aren't already owned
    (memberProjects || []).forEach((mp: any) => {
      if (mp.projects && !ownedProjectIds.has(mp.projects.id)) {
        allProjects.push(mp.projects);
      }
    });

    // Sort by created_at
    allProjects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Transform the data to match the ProjectWithTasks interface
    return allProjects.map((project) => ({
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
      ownerId: project.owner_id,
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
  teamMembers?: { id: string; name: string; email: string; avatar_url?: string | null }[];
}): Promise<Project> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User must be authenticated to create projects');

    // Create the project
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
        owner_id: user.id,
        progress: 0,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Add team members if provided
    if (projectData.teamMembers && projectData.teamMembers.length > 0) {
      const members = projectData.teamMembers.map((member) => ({
        project_id: project.id,
        user_id: member.id,
        member_name: member.name,
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
      assignee: taskData.assignee || 'You',
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
    const user = await getCurrentUser();
    if (!user) throw new Error('User must be authenticated');

    // Check if already favorited
    const { data: existing, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existing) {
      // Remove favorite
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (deleteError) throw deleteError;
      return false;
    } else {
      // Add favorite
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          project_id: projectId,
        });

      if (insertError) throw insertError;
      return true;
    }
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
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('favorites')
      .select('project_id')
      .eq('user_id', user.id);

    if (error) throw error;
    return (data || []).map(fav => fav.project_id);
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
}

/**
 * Get all favorite projects for the current user
 */
export async function getFavoriteProjects(): Promise<ProjectWithTasks[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        project_id,
        projects (
          *,
          tasks (*),
          project_members (member_name)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!favorites) return [];

    // Transform the data
    return favorites
      .filter((fav: any) => fav.projects) // Filter out null projects
      .map((fav: any) => {
        const project = fav.projects;
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
          ownerId: project.owner_id,
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
      });
  } catch (error) {
    console.error('Error fetching favorite projects:', error);
    throw error;
  }
}

/**
 * Get dashboard statistics for the current user
 */
export async function getDashboardStats() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        totalProjects: 0,
        activeProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        upcomingDeadlines: 0,
      };
    }

    // Get all projects (owned + member of)
    const { data: ownedProjects } = await supabase
      .from('projects')
      .select('id, status')
      .eq('owner_id', user.id);

    const { data: memberProjects } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id);

    const allProjectIds = [
      ...(ownedProjects || []).map(p => p.id),
      ...(memberProjects || []).map(m => m.project_id),
    ];

    const uniqueProjectIds = [...new Set(allProjectIds)];

    // Count active projects (not Completed, Paused, or Archived)
    const activeCount = (ownedProjects || []).filter(
      p => !['Completed', 'Paused', 'Archived'].includes(p.status)
    ).length;

    // Get tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('completed, deadline')
      .in('project_id', uniqueProjectIds.length > 0 ? uniqueProjectIds : ['']);

    const completedCount = (tasks || []).filter(t => t.completed).length;

    // Count upcoming deadlines (within 7 days)
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingCount = (tasks || []).filter(t => {
      if (!t.deadline || t.completed) return false;
      const deadline = new Date(t.deadline);
      return deadline >= now && deadline <= sevenDaysFromNow;
    }).length;

    return {
      totalProjects: uniqueProjectIds.length,
      activeProjects: activeCount,
      totalTasks: tasks?.length || 0,
      completedTasks: completedCount,
      upcomingDeadlines: upcomingCount,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      totalProjects: 0,
      activeProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      upcomingDeadlines: 0,
    };
  }
}

/**
 * Get recent activity (recently updated projects and tasks)
 */
export async function getRecentActivity() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    // Get all project IDs (owned + member)
    const { data: ownedProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id);

    const { data: memberProjects } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id);

    const allProjectIds = [
      ...(ownedProjects || []).map(p => p.id),
      ...(memberProjects || []).map(m => m.project_id),
    ];

    const uniqueProjectIds = [...new Set(allProjectIds)];

    if (uniqueProjectIds.length === 0) {
      return [];
    }

    // Get recent projects
    const { data: recentProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, status, updated_at, color')
      .in('id', uniqueProjectIds)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (projectsError) {
      console.error('Error fetching recent projects:', projectsError);
    }

    // Get recent tasks from these projects
    const { data: recentTasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        id,
        name,
        status,
        completed,
        updated_at,
        project_id,
        projects (name, color)
      `)
      .in('project_id', uniqueProjectIds)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (tasksError) {
      console.error('Error fetching recent tasks:', tasksError);
    }

    // Combine and sort by updated_at
    const activities = [
      ...(recentProjects || []).map((p: any) => ({
        id: p.id,
        type: 'project' as const,
        title: p.name,
        subtitle: `Status: ${p.status}`,
        timestamp: p.updated_at,
        color: p.color || '#3b82f6',
      })),
      ...(recentTasks || []).map((t: any) => ({
        id: t.id,
        type: 'task' as const,
        title: t.name,
        subtitle: `${t.projects?.name || 'Unknown'} • ${t.status}`,
        timestamp: t.updated_at,
        color: t.projects?.color || '#3b82f6',
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    console.log('Combined activities:', activities.length);
    
    return activities.slice(0, 10);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
}

/**
 * Get upcoming tasks (within next 7 days)
 */
export async function getUpcomingTasks() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    // Get project IDs
    const { data: ownedProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id);

    const { data: memberProjects } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id);

    const allProjectIds = [
      ...(ownedProjects || []).map(p => p.id),
      ...(memberProjects || []).map(m => m.project_id),
    ];

    const uniqueProjectIds = [...new Set(allProjectIds)];

    console.log('Upcoming Tasks - Project IDs:', uniqueProjectIds);

    if (uniqueProjectIds.length === 0) {
      console.log('No projects found for upcoming tasks');
      return [];
    }

    // Get upcoming tasks
    const now = new Date().toISOString().split('T')[0];
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log('Date range:', { now, sevenDaysFromNow });

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        id,
        name,
        deadline,
        priority,
        status,
        completed,
        project_id,
        projects (name, color)
      `)
      .in('project_id', uniqueProjectIds)
      .eq('completed', false)
      .not('deadline', 'is', null)
      .gte('deadline', now)
      .lte('deadline', sevenDaysFromNow)
      .order('deadline', { ascending: true });

    if (tasksError) {
      console.error('Error fetching upcoming tasks:', tasksError);
    }

    console.log('Upcoming tasks found:', tasks?.length || 0);
    console.log('Tasks:', tasks);

    return (tasks || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      deadline: t.deadline,
      priority: t.priority,
      status: t.status,
      projectName: t.projects?.name || 'Unknown Project',
      projectColor: t.projects?.color || '#3b82f6',
    }));
  } catch (error) {
    console.error('Error getting upcoming tasks:', error);
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

/**
 * Search for users by name (for adding to projects)
 */
export async function searchUsers(query: string): Promise<{ id: string; name: string; email: string; avatar_url: string | null }[]> {
  try {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .ilike('full_name', `%${query}%`)
      .limit(10);

    if (error) throw error;

    return (data || []).map((user) => ({
      id: user.id,
      name: user.full_name || user.email,
      email: user.email,
      avatar_url: user.avatar_url,
    }));
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

/**
 * Get team members for a specific project
 */
export async function getProjectTeamMembers(projectId: string): Promise<{ id: string; name: string; email: string; avatar_url: string | null }[]> {
  try {
    // First get project members
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select('user_id, member_name')
      .eq('project_id', projectId);

    if (membersError) throw membersError;
    if (!members || members.length === 0) return [];

    // Get user IDs
    const userIds = members.map(m => m.user_id);

    // Then get profiles for those users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, avatar_url')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // Combine the data
    return members.map(member => {
      const profile = profiles?.find(p => p.id === member.user_id);
      return {
        id: member.user_id,
        name: member.member_name,
        email: profile?.email || '',
        avatar_url: profile?.avatar_url || null,
      };
    });
  } catch (error) {
    console.error('Error getting project team members:', error);
    return [];
  }
}

// =====================================================
// TASK FAVORITES
// =====================================================

/**
 * Toggle favorite status for a task
 */
export async function toggleTaskFavorite(taskId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User must be authenticated');

    // Check if already favorited
    const { data: existing, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('task_id', taskId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existing) {
      // Remove favorite
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (deleteError) throw deleteError;
      return false;
    } else {
      // Add favorite
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          task_id: taskId,
        });

      if (insertError) throw insertError;
      return true;
    }
  } catch (error) {
    console.error('Error toggling task favorite:', error);
    throw error;
  }
}

/**
 * Get all favorite tasks for the current user
 */
export async function getFavoriteTasks(): Promise<Task[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        task_id,
        tasks (
          id,
          project_id,
          name,
          deadline,
          priority,
          assignee,
          status,
          completed,
          created_at,
          projects (name, color)
        )
      `)
      .eq('user_id', user.id)
      .not('task_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!favorites) return [];

    // Transform the data
    return favorites
      .filter((fav: any) => fav.tasks) // Filter out null tasks
      .map((fav: any) => {
        const task = fav.tasks;
        return {
          id: task.id,
          projectId: task.project_id,
          name: task.name,
          deadline: task.deadline,
          priority: task.priority,
          assignee: task.assignee || 'Unassigned',
          status: task.status as TaskStatus,
          completed: task.completed,
          createdAt: task.created_at,
          projectName: task.projects?.name || 'Unknown Project',
          projectColor: task.projects?.color || '#3b82f6',
        };
      });
  } catch (error) {
    console.error('Error fetching favorite tasks:', error);
    throw error;
  }
}

/**
 * Get favorite task IDs for the current user
 */
export async function getFavoriteTaskIds(): Promise<string[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('favorites')
      .select('task_id')
      .eq('user_id', user.id)
      .not('task_id', 'is', null);

    if (error) throw error;
    return (data || []).map(fav => fav.task_id).filter(Boolean);
  } catch (error) {
    console.error('Error getting favorite task IDs:', error);
    return [];
  }
}

// =====================================================
// MEMBER FAVORITES
// =====================================================

/**
 * Toggle favorite status for a team member
 */
export async function toggleMemberFavorite(memberId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User must be authenticated');

    // Prevent users from favoriting themselves
    if (user.id === memberId) {
      throw new Error('Cannot favorite yourself');
    }

    // Check if already favorited
    const { data: existing, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('member_id', memberId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existing) {
      // Remove favorite
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (deleteError) throw deleteError;
      return false;
    } else {
      // Add favorite
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          member_id: memberId,
        });

      if (insertError) throw insertError;
      return true;
    }
  } catch (error) {
    console.error('Error toggling member favorite:', error);
    throw error;
  }
}

/**
 * Get all favorite team members for the current user
 */
export async function getFavoriteMembers(): Promise<{ id: string; name: string; email: string; avatar_url: string | null }[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        member_id,
        profiles!favorites_member_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .not('member_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!favorites) return [];

    // Transform the data
    return favorites
      .filter((fav: any) => fav.profiles) // Filter out null profiles
      .map((fav: any) => {
        const profile = fav.profiles;
        return {
          id: profile.id,
          name: profile.full_name || profile.email,
          email: profile.email,
          avatar_url: profile.avatar_url,
        };
      });
  } catch (error) {
    console.error('Error fetching favorite members:', error);
    throw error;
  }
}

/**
 * Get favorite member IDs for the current user
 */
export async function getFavoriteMemberIds(): Promise<string[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('favorites')
      .select('member_id')
      .eq('user_id', user.id)
      .not('member_id', 'is', null);

    if (error) throw error;
    return (data || []).map(fav => fav.member_id).filter(Boolean);
  } catch (error) {
    console.error('Error getting favorite member IDs:', error);
    return [];
  }
}

/**
 * Get all team members the user collaborates with (across all projects)
 */
export async function getAllTeamMembers(): Promise<{ id: string; name: string; email: string; avatar_url: string | null }[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    // Get all projects the user is part of
    const { data: ownedProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id);

    const { data: memberProjects } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id);

    const allProjectIds = [
      ...(ownedProjects || []).map(p => p.id),
      ...(memberProjects || []).map(m => m.project_id),
    ];

    const uniqueProjectIds = [...new Set(allProjectIds)];

    if (uniqueProjectIds.length === 0) return [];

    // Get all team members from these projects
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select('user_id, member_name')
      .in('project_id', uniqueProjectIds);

    if (membersError) throw membersError;
    if (!members || members.length === 0) return [];

    // Get unique user IDs (excluding current user)
    const uniqueUserIds = [...new Set(members.map(m => m.user_id))].filter(id => id !== user.id);

    if (uniqueUserIds.length === 0) return [];

    // Get profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', uniqueUserIds);

    if (profilesError) throw profilesError;

    // Combine the data
    return (profiles || []).map(profile => ({
      id: profile.id,
      name: profile.full_name || profile.email,
      email: profile.email,
      avatar_url: profile.avatar_url,
    }));
  } catch (error) {
    console.error('Error getting all team members:', error);
    return [];
  }
}
