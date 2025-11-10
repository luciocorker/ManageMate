import { ProjectActionsMenu } from '@/components/project-actions-menu';
import { ProjectCard } from '@/components/project-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getProjectsWithTasks } from '@/data/mockData';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Project, ProjectPriority, ProjectStatus } from '@/types/project';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'date' | 'progress' | 'priority';

export default function ProjectScreen() {
  const [projects, setProjects] = useState<Project[]>(getProjectsWithTasks());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  // Filter and sort projects
  const getFilteredAndSortedProjects = () => {
    let filtered = projects;

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

  // Actions
  const handleFavoriteToggle = (projectId: number) => {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const handleDuplicate = (project: Project) => {
    const newProject: Project = {
      ...project,
      id: Math.max(...projects.map(p => p.id)) + 1,
      name: `${project.name} (Copy)`,
      status: 'Planning',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: project.tasks?.map(t => ({ ...t, id: Math.random(), completed: false })),
    };
    setProjects([newProject, ...projects]);
    Alert.alert('Success', 'Project duplicated successfully');
  };

  const handleTogglePause = (projectId: number) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return { ...p, status: p.status === 'Paused' ? 'In Progress' : 'Paused' };
      }
      return p;
    }));
  };

  const handleMarkComplete = (projectId: number) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return { ...p, status: 'Completed', progress: 100 };
      }
      return p;
    }));
    Alert.alert('Success', 'Project marked as complete');
  };

  const handleArchive = (projectId: number) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return { ...p, status: 'Archived' };
      }
      return p;
    }));
    Alert.alert('Success', 'Project archived');
  };

  const handleDelete = (projectId: number) => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProjects(projects.filter(p => p.id !== projectId));
            Alert.alert('Success', 'Project deleted');
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Projects</ThemedText>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: tintColor }]}>
          <IconSymbol name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: backgroundColor }]}>
        <IconSymbol name="magnifyingglass" size={20} color={iconColor} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search projects..."
          placeholderTextColor={iconColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters and Controls */}
      <View style={styles.controls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {/* Status Filter */}
          <TouchableOpacity 
            style={[styles.filterButton, statusFilter !== 'All' && { backgroundColor: tintColor }]}
            onPress={() => setStatusFilter(statusFilter === 'All' ? 'In Progress' : 'All')}
          >
            <IconSymbol name="line.3.horizontal.decrease" size={16} color={statusFilter !== 'All' ? '#fff' : iconColor} />
            <ThemedText style={[styles.filterText, statusFilter !== 'All' && { color: '#fff' }]}>
              {statusFilter}
            </ThemedText>
          </TouchableOpacity>

          {/* Priority Filter */}
          <TouchableOpacity 
            style={[styles.filterButton, priorityFilter !== 'All' && { backgroundColor: tintColor }]}
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
            <IconSymbol name="arrow.up.arrow.down" size={16} color={iconColor} />
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
              color={viewMode === 'grid' ? tintColor : iconColor} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('list')}>
            <IconSymbol 
              name="list.bullet" 
              size={22} 
              color={viewMode === 'list' ? tintColor : iconColor} 
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
              onPress={() => Alert.alert('Navigate', `Go to ${project.name} details`)}
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
          onEdit={() => Alert.alert('Edit', 'Edit functionality coming soon')}
          onDuplicate={() => handleDuplicate(selectedProject)}
          onToggleFavorite={() => handleFavoriteToggle(selectedProject.id)}
          onTogglePause={() => handleTogglePause(selectedProject.id)}
          onMarkComplete={() => handleMarkComplete(selectedProject.id)}
          onArchive={() => handleArchive(selectedProject.id)}
          onDelete={() => handleDelete(selectedProject.id)}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    flex: 1,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
    borderColor: '#e5e7eb',
    marginRight: 8,
    gap: 4,
  },
  filterText: {
    fontSize: 14,
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
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});
