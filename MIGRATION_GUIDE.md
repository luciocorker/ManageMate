# Migration from Mock Data to Supabase

This guide shows the changes needed to migrate from mock data to real Supabase data.

## Overview

The following files need to be updated to use Supabase instead of mock data:
- `app/(tabs)/project.tsx` - Projects list page
- `app/(tabs)/calendar.tsx` - Calendar page
- `app/(tabs)/project/[id].tsx` - Project details page
- `components/date-picker-modal.tsx` - Date picker modal
- `components/create-project-modal.tsx` - Create project modal
- `app/(tabs)/favorites.tsx` - Favorites page

## Key Changes

### 1. Replace Import Statement

**Before:**
```typescript
import { getProjectsWithTasks } from '@/data/mockData';
```

**After:**
```typescript
import { getProjectsWithTasks } from '@/lib/supabaseService';
```

### 2. Add State Management with React Hooks

Since Supabase is asynchronous, you'll need to use React hooks to manage loading and error states.

**Add these imports:**
```typescript
import { useState, useEffect } from 'react';
```

**Add state variables:**
```typescript
const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### 3. Load Data with useEffect

**Replace direct data access with async loading:**

**Before:**
```typescript
const projects = getProjectsWithTasks();
```

**After:**
```typescript
useEffect(() => {
  loadProjects();
}, []);

const loadProjects = async () => {
  try {
    setLoading(true);
    const data = await getProjectsWithTasks();
    setProjects(data);
    setError(null);
  } catch (err) {
    console.error('Error loading projects:', err);
    setError('Failed to load projects');
  } finally {
    setLoading(false);
  }
};
```

### 4. Add Loading and Error States to UI

**Add loading indicator:**
```typescript
if (loading) {
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" color="#DC2626" />
      <ThemedText style={styles.loadingText}>Loading projects...</ThemedText>
    </ThemedView>
  );
}
```

**Add error handling:**
```typescript
if (error) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.errorText}>{error}</ThemedText>
      <TouchableOpacity onPress={loadProjects} style={styles.retryButton}>
        <ThemedText style={styles.retryText}>Retry</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
```

### 5. Update Create/Update/Delete Operations

**Creating a Project (in create-project-modal.tsx):**

```typescript
import { createProject } from '@/lib/supabaseService';

const handleCreateProject = async () => {
  try {
    await createProject({
      name: projectName,
      description: projectDescription,
      status: selectedStatus,
      priority: selectedPriority,
      deadline: selectedDate || undefined,
      budget: projectBudget || undefined,
      color: selectedColor,
      teamMembers: newTeamMembers.filter(m => m.trim()),
    });
    
    // Refresh projects list
    onProjectCreated();
    onClose();
  } catch (err) {
    console.error('Error creating project:', err);
    alert('Failed to create project');
  }
};
```

**Creating a Task (in project/[id].tsx):**

```typescript
import { createTask, updateProjectProgress } from '@/lib/supabaseService';

const handleAddTask = async () => {
  try {
    await createTask(projectId, {
      name: newTaskName,
      deadline: newTaskDeadline,
      priority: newTaskPriority,
      assignee: newTaskAssignee.trim() || 'You',
    });
    
    // Update progress after adding task
    await updateProjectProgress(projectId);
    
    // Refresh project data
    loadProject();
    
    // Reset form
    setNewTaskName('');
    setNewTaskDeadline('');
    setNewTaskAssignee('');
  } catch (err) {
    console.error('Error adding task:', err);
    alert('Failed to add task');
  }
};
```

**Updating Task Status:**

```typescript
import { updateTaskStatus, updateProjectProgress } from '@/lib/supabaseService';

const handleTaskStatusChange = async (taskId: string) => {
  try {
    const task = project.tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'Not Started') return;

    await updateTaskStatus(taskId, 'In Progress', false);
    await updateProjectProgress(project.id);
    
    // Refresh project data
    loadProject();
  } catch (err) {
    console.error('Error updating task status:', err);
    alert('Failed to update task status');
  }
};
```

**Deleting a Task:**

```typescript
import { deleteTask, updateProjectProgress } from '@/lib/supabaseService';

const handleDeleteTask = async (taskId: string) => {
  try {
    await deleteTask(taskId);
    await updateProjectProgress(project.id);
    
    // Refresh project data
    loadProject();
  } catch (err) {
    console.error('Error deleting task:', err);
    alert('Failed to delete task');
  }
};
```

### 6. Real-time Updates (Optional)

For live updates when data changes:

```typescript
import { subscribeToProjects } from '@/lib/supabaseService';

useEffect(() => {
  // Subscribe to real-time updates
  const unsubscribe = subscribeToProjects(() => {
    loadProjects(); // Reload when data changes
  });

  // Cleanup subscription
  return () => {
    unsubscribe();
  };
}, []);
```

### 7. Favorites Integration

**Toggle favorite:**

```typescript
import { toggleFavorite, getFavoriteProjectIds } from '@/lib/supabaseService';

const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

// Load favorites on mount
useEffect(() => {
  loadFavorites();
}, []);

const loadFavorites = async () => {
  const ids = await getFavoriteProjectIds();
  setFavoriteIds(ids);
};

const handleToggleFavorite = async (projectId: string) => {
  try {
    const isFavorite = await toggleFavorite(projectId);
    
    if (isFavorite) {
      setFavoriteIds([...favoriteIds, projectId]);
    } else {
      setFavoriteIds(favoriteIds.filter(id => id !== projectId));
    }
  } catch (err) {
    console.error('Error toggling favorite:', err);
    alert('Failed to update favorite');
  }
};
```

## Files That Need Updates

### Priority 1: Core Data Display
1. ✅ `app/(tabs)/project.tsx` - Main projects list
2. ✅ `app/(tabs)/calendar.tsx` - Calendar with due dates
3. ✅ `app/(tabs)/project/[id].tsx` - Project details
4. ✅ `app/(tabs)/favorites.tsx` - Favorites list

### Priority 2: Data Modification
5. ✅ `components/create-project-modal.tsx` - Create new projects
6. ✅ `components/date-picker-modal.tsx` - Show due dates in picker

## Testing Checklist

After migrating to Supabase, test these features:

- [ ] Projects list loads correctly
- [ ] Calendar shows task/project due dates
- [ ] Can create new projects
- [ ] Can add tasks to projects
- [ ] Task status changes work (Not Started → In Progress)
- [ ] Progress auto-calculates when tasks complete
- [ ] Can assign tasks to team members
- [ ] Favorites can be toggled
- [ ] Date picker shows existing due dates
- [ ] Navigation from calendar to project details works
- [ ] Real-time updates work (if implemented)

## Common Issues

### Issue: "User not authenticated"
**Solution:** Implement authentication flow (sign up/sign in screens)

### Issue: Projects not loading
**Solution:** Check:
1. Supabase credentials in `app.json` are correct
2. Database schema was run successfully
3. User is authenticated
4. RLS policies are configured correctly

### Issue: "Failed to fetch"
**Solution:** 
1. Verify internet connection
2. Check Supabase project is active
3. Verify API URL is correct

### Issue: Changes not persisting
**Solution:**
1. Check for error messages in console
2. Verify RLS policies allow the operation
3. Ensure user owns the project being modified

## Development vs Production

### Development
- Use test Supabase project
- Can reset database anytime
- Safe to experiment with data

### Production
- Use separate Supabase project
- Implement proper error handling
- Add data validation
- Set up backups
- Monitor usage and performance

## Next Steps After Migration

1. **Add Authentication:**
   - Create sign up/sign in screens
   - Implement password reset
   - Add profile management

2. **Enhance Features:**
   - Add project sharing/collaboration
   - Implement notifications
   - Add file attachments
   - Create activity logs

3. **Optimize Performance:**
   - Add pagination for large datasets
   - Implement data caching
   - Use optimistic updates

4. **Improve UX:**
   - Add offline support
   - Implement pull-to-refresh
   - Add search/filter functionality

---

Need help? Check `SUPABASE_SETUP.md` for setup instructions or review `lib/supabaseService.ts` for API documentation.
