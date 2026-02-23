import { CreateProjectModal, ProjectFormData } from '@/components/create-project-modal';
import { ProjectActionsMenu } from '@/components/project-actions-menu';
import { ProjectCard } from '@/components/project-card';
import { ThemedAlert } from '@/components/themed-alert';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
    createProject,
    deleteProject,
    getFavoriteProjectIds,
    getProjectsWithTasks,
    toggleFavorite,
    updateProject
} from '@/lib/supabaseService';
import { Project, ProjectPriority, ProjectStatus } from '@/types/project';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'date' | 'progress' | 'priority';

interface AlertConfig {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
}

export default function ProjectScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [alert, setAlert] = useState<AlertConfig>({ visible: false, title: '' });
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Load projects from Supabase
  useEffect(() => {
    loadProjects();
    loadFavorites();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjectsWithTasks();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to load projects. Please try again.',
        buttons: [{ text: 'OK' }]
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const ids = await getFavoriteProjectIds();
      setFavoriteIds(ids);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Filter and sort projects
  const getFilteredAndSortedProjects = () => {
    let filtered = projects.map(p => ({
      ...p,
      isFavorite: favoriteIds.includes(p.id)
    }));

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(p => p.priority === priorityFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'progress':
          return b.progress - a.progress;
        case 'priority':
          const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    return sorted;
  };

  const filteredProjects = getFilteredAndSortedProjects();

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.searchIconButton} disabled>
            <IconSymbol name="magnifyingglass" size={24} color="#999" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Projects</ThemedText>
          <TouchableOpacity style={styles.addButton} disabled>
            <IconSymbol name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <ThemedText style={styles.loadingText}>Loading projects...</ThemedText>
        </View>
      </View>
    );
  }

  // Actions
  const handleFavoriteToggle = async (projectId: string) => {
    try {
      const isFavorite = await toggleFavorite(projectId);
      if (isFavorite) {
        setFavoriteIds([...favoriteIds, projectId]);
      } else {
        setFavoriteIds(favoriteIds.filter(id => id !== projectId));
      }
      // Update local state
      setProjects(projects.map(p =>
        p.id === projectId ? { ...p, isFavorite } : p
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to update favorite',
        buttons: [{ text: 'OK' }]
      });
    }
  };

  const handleDuplicate = async (project: Project) => {
    try {
      await createProject({
        name: `${project.name} (Copy)`,
        description: project.description || '',
        status: 'Planning',
        priority: project.priority,
        deadline: project.deadline,
        budget: project.budget?.toString(),
        color: project.color,
        teamMembers: project.team,
      });
      await loadProjects();
      setAlert({
        visible: true,
        title: 'Success',
        message: 'Project duplicated successfully',
        buttons: [{ text: 'OK' }]
      });
    } catch (error) {
      console.error('Error duplicating project:', error);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to duplicate project',
        buttons: [{ text: 'OK' }]
      });
    }
  };

  const handleTogglePause = async (projectId: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      await updateProject(projectId, {
        status: project.status === 'Paused' ? 'In Progress' : 'Paused'
      });
      await loadProjects();
    } catch (error) {
      console.error('Error toggling pause:', error);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to update project status',
        buttons: [{ text: 'OK' }]
      });
    }
  };

  const handleMarkComplete = async (projectId: string) => {
    try {
      await updateProject(projectId, {
        status: 'Completed',
        progress: 100
      });
      await loadProjects();
      setAlert({
        visible: true,
        title: 'Success',
        message: 'Project marked as complete',
        buttons: [{ text: 'OK' }]
      });
    } catch (error) {
      console.error('Error marking complete:', error);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to complete project',
        buttons: [{ text: 'OK' }]
      });
    }
  };

  const handleArchive = async (projectId: string) => {
    try {
      await updateProject(projectId, {
        status: 'Archived'
      });
      await loadProjects();
      setAlert({
        visible: true,
        title: 'Success',
        message: 'Project archived',
        buttons: [{ text: 'OK' }]
      });
    } catch (error) {
      console.error('Error archiving project:', error);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to archive project',
        buttons: [{ text: 'OK' }]
      });
    }
  };

  const handleDelete = (projectId: string) => {
    setAlert({
      visible: true,
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(projectId);
              await loadProjects();
              setAlert({
                visible: true,
                title: 'Success',
                message: 'Project deleted',
                buttons: [{ text: 'OK' }]
              });
            } catch (error) {
              console.error('Error deleting project:', error);
              setAlert({
                visible: true,
                title: 'Error',
                message: 'Failed to delete project',
                buttons: [{ text: 'OK' }]
              });
            }
          },
        },
      ]
    });
  };

  const handleCreateProject = async (formData: ProjectFormData) => {
    try {
      await createProject({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        deadline: formData.deadline,
        budget: formData.budget,
        color: '#DC2626',
        teamMembers: formData.team,
      });
      await loadProjects();
      setShowCreateModal(false);
      setAlert({
        visible: true,
        title: 'Success',
        message: 'Project created successfully',
        buttons: [{ text: 'OK' }]
      });
    } catch (error) {
      console.error('Error creating project:', error);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to create project',
        buttons: [{ text: 'OK' }]
      });
    }
  };

  const handleProjectPress = (projectId: string) => {
    router.push(`/project/${projectId}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.searchIconButton} 
          onPress={() => setShowSearchBar(!showSearchBar)}
        >
          <IconSymbol name={showSearchBar ? "xmark" : "magnifyingglass"} size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Projects</ThemedText>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
          <IconSymbol name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearchBar && (
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filters and Controls */}
      <View style={styles.controls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {/* Status Filter */}
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              statusFilter !== 'All' && { backgroundColor: '#DC2626', borderColor: '#DC2626' }
            ]}
            onPress={() => setStatusFilter(statusFilter === 'All' ? 'In Progress' : 'All')}
          >
            <IconSymbol name="line.3.horizontal.decrease" size={16} color={statusFilter !== 'All' ? '#fff' : '#999'} />
            <ThemedText style={[styles.filterText, statusFilter !== 'All' && { color: '#fff' }]}>
              {statusFilter}
            </ThemedText>
          </TouchableOpacity>

          {/* Priority Filter */}
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              priorityFilter !== 'All' && { backgroundColor: '#DC2626', borderColor: '#DC2626' }
            ]}
            onPress={() => setPriorityFilter(priorityFilter === 'All' ? 'High' : 'All')}
          >
            <ThemedText style={[styles.filterText, priorityFilter !== 'All' && { color: '#fff' }]}>
              {priorityFilter === 'All' ? 'Priority' : priorityFilter}
            </ThemedText>
          </TouchableOpacity>

          {/* Sort */}
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => {
              const options: SortOption[] = ['name', 'date', 'progress', 'priority'];
              const currentIndex = options.indexOf(sortBy);
              setSortBy(options[(currentIndex + 1) % options.length]);
            }}
          >
            <IconSymbol name="arrow.up.arrow.down" size={16} color="#999" />
            <ThemedText style={styles.filterText}>
              {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>

        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity onPress={() => setViewMode('grid')}>
            <IconSymbol 
              name="square.grid.2x2" 
              size={22} 
              color={viewMode === 'grid' ? '#DC2626' : '#999'} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('list')}>
            <IconSymbol 
              name="list.bullet" 
              size={22} 
              color={viewMode === 'list' ? '#DC2626' : '#999'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Projects List */}
      <ScrollView contentContainerStyle={styles.content}>
        {filteredProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No projects found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'Try adjusting your filters'
                : 'Create your first project to get started'}
            </ThemedText>
          </View>
        ) : (
          filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onPress={() => handleProjectPress(project.id)}
              onFavoriteToggle={() => handleFavoriteToggle(project.id)}
              onMenuPress={() => {
                setSelectedProject(project);
                setShowActionsMenu(true);
              }}
            />
          ))
        )}
      </ScrollView>

      {/* Actions Menu */}
      {selectedProject && (
        <ProjectActionsMenu
          visible={showActionsMenu}
          onClose={() => setShowActionsMenu(false)}
          project={selectedProject}
          onEdit={() => setAlert({
            visible: true,
            title: 'Edit',
            message: 'Edit functionality coming soon',
            buttons: [{ text: 'OK' }]
          })}
          onDuplicate={() => handleDuplicate(selectedProject)}
          onToggleFavorite={() => handleFavoriteToggle(selectedProject.id)}
          onTogglePause={() => handleTogglePause(selectedProject.id)}
          onMarkComplete={() => handleMarkComplete(selectedProject.id)}
          onArchive={() => handleArchive(selectedProject.id)}
          onDelete={() => handleDelete(selectedProject.id)}
        />
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateProject={handleCreateProject}
      />

      {/* Themed Alert */}
      <ThemedAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={() => setAlert({ visible: false, title: '' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  searchIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  addButton: {
    backgroundColor: '#DC2626',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  filters: {
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginRight: 8,
    gap: 4,
    backgroundColor: '#1e1e1e',
  },
  filterText: {
    fontSize: 14,
    color: 'white',
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: 'white',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
});
