import { ProjectCard } from "@/components/project-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/contexts/ThemeContext";
import {
    getFavoriteProjects,
    getFavoriteTasks,
    getProjectsWithTasks,
    toggleFavorite,
    toggleTaskFavorite,
    updateProjectProgress,
} from "@/lib/supabaseService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type TabType = 'projects' | 'tasks';

interface ProjectWithTasks {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  deadline?: string;
  budget?: number;
  color: string;
  team: string[];
  createdAt: string;
  updatedAt: string;
  tasks: any[];
  teamMembers: string[];
}

interface FavoriteTask {
  id: string;
  projectId: string;
  name: string;
  deadline?: string;
  priority: string;
  assignee?: string;
  status: string;
  completed: boolean;
  createdAt: string;
  projectName?: string;
  projectColor?: string;
}

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [tasks, setTasks] = useState<FavoriteTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<ProjectWithTasks[]>([]);
  const [availableTasks, setAvailableTasks] = useState<FavoriteTask[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadFavorites = async () => {
    try {
      const [favoriteProjects, favoriteTasks] = await Promise.all([
        getFavoriteProjects(),
        getFavoriteTasks(),
      ]);
      
      setProjects(favoriteProjects);
      setTasks(favoriteTasks);
    } catch (error) {
      console.error("Error loading favorites:", error);
      Alert.alert("Error", "Failed to load favorites");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleProjectPress = (projectId: string) => {
    router.push(`/(tabs)/project/${projectId}` as any);
  };

  const handleFavoriteToggle = async (projectId: string) => {
    try {
      const isFavorited = await toggleFavorite(projectId);
      if (!isFavorited) {
        // Remove from list since it's no longer a favorite
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      }
      // Recalculate progress after toggling
      await updateProjectProgress(projectId);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", "Failed to update favorite status");
    }
  };

  const handleMenuPress = (projectId: string) => {
    // Menu actions would go here
    console.log("Menu pressed for project:", projectId);
  };

  const handleTaskToggle = async (taskId: string) => {
    try {
      // Update task completion status
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Note: You'll need to add an updateTaskStatus export in supabaseService
      // For now, just update locally
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (error) {
      console.error("Error toggling task:", error);
      Alert.alert("Error", "Failed to update task status");
    }
  };

  const handleTaskFavoriteToggle = async (taskId: string) => {
    try {
      await toggleTaskFavorite(taskId);
      // Remove from list since it's no longer a favorite
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Error toggling task favorite:", error);
      Alert.alert("Error", "Failed to update task favorite status");
    }
  };

  const loadAvailableItems = async () => {
    try {
      if (activeTab === 'projects') {
        const allProjects = await getProjectsWithTasks();
        // Filter out already favorited projects
        const favoriteIds = new Set(projects.map(p => p.id));
        setAvailableProjects(allProjects.filter(p => !favoriteIds.has(p.id)));
      } else if (activeTab === 'tasks') {
        const allProjects = await getProjectsWithTasks();
        const allTasks: FavoriteTask[] = [];
        
        // Flatten all tasks from all projects
        allProjects.forEach(project => {
          project.tasks.forEach(task => {
            allTasks.push({
              id: task.id,
              projectId: project.id,
              name: task.name,
              deadline: task.deadline,
              priority: task.priority,
              assignee: task.assignee,
              status: task.status,
              completed: task.completed,
              createdAt: task.createdAt,
              projectName: project.name,
              projectColor: project.color,
            });
          });
        });
        
        // Filter out already favorited tasks
        const favoriteIds = new Set(tasks.map(t => t.id));
        setAvailableTasks(allTasks.filter(t => !favoriteIds.has(t.id)));
      }
    } catch (error) {
      console.error("Error loading available items:", error);
      Alert.alert("Error", "Failed to load available items");
    }
  };

  const handleOpenAddModal = async () => {
    await loadAvailableItems();
    setShowAddModal(true);
  };

  const handleAddToFavorites = async (itemId: string) => {
    try {
      if (activeTab === 'projects') {
        await toggleFavorite(itemId);
        const addedProject = availableProjects.find(p => p.id === itemId);
        if (addedProject) {
          setProjects(prev => [...prev, addedProject]);
          setAvailableProjects(prev => prev.filter(p => p.id !== itemId));
        }
      } else if (activeTab === 'tasks') {
        await toggleTaskFavorite(itemId);
        const addedTask = availableTasks.find(t => t.id === itemId);
        if (addedTask) {
          setTasks(prev => [...prev, addedTask]);
          setAvailableTasks(prev => prev.filter(t => t.id !== itemId));
        }
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      Alert.alert("Error", "Failed to add to favorites");
    }
  };

  const getFilteredAvailableItems = () => {
    const query = searchQuery.toLowerCase();
    
    if (activeTab === 'projects') {
      return availableProjects.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query)
      );
    } else {
      return availableTasks.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.projectName?.toLowerCase().includes(query)
      );
    }
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header with Tabs */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Favorites
        </ThemedText>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'projects' && styles.activeTab]}
            onPress={() => setActiveTab('projects')}
          >
            <IconSymbol name="folder.fill" size={18} color={activeTab === 'projects' ? colors.primary : colors.textSecondary} />
            <ThemedText style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>
              Projects
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
            onPress={() => setActiveTab('tasks')}
          >
            <IconSymbol name="checkmark" size={18} color={activeTab === 'tasks' ? colors.primary : colors.textSecondary} />
            <ThemedText style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>
              Tasks
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#DC2626"
          />
        }
      >
        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <>
            {projects.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol
                  name="star.fill"
                  size={64}
                  color="#DC2626"
                  style={styles.emptyIcon}
                />
                <ThemedText type="subtitle" style={styles.emptyTitle}>
                  No Favorite Projects
                </ThemedText>
                <ThemedText style={styles.emptyDescription}>
                  Tap the star icon on any project to add it to your favorites for
                  quick access.
                </ThemedText>
                <TouchableOpacity
                  style={styles.addButtonLarge}
                  onPress={handleOpenAddModal}
                >
                  <IconSymbol name="plus" size={20} color="#DC2626" />
                  <ThemedText style={styles.addButtonText}>Add Projects to Favorites</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.tabHeader}>
                  <ThemedText style={styles.description}>
                    Quick access to your {projects.length} favorite{" "}
                    {projects.length === 1 ? "project" : "projects"}.
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.addButtonSmall}
                    onPress={handleOpenAddModal}
                  >
                    <IconSymbol name="plus" size={18} color="#DC2626" />
                  </TouchableOpacity>
                </View>
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={{
                      id: project.id,
                      name: project.name,
                      description: project.description,
                      status: project.status as any,
                      priority: project.priority as any,
                      progress: project.progress,
                      deadline: project.deadline,
                      budget: project.budget,
                      color: project.color,
                      team: project.teamMembers,
                      createdAt: project.createdAt,
                      updatedAt: project.updatedAt,
                      isFavorite: true,
                    }}
                    onPress={() => handleProjectPress(project.id)}
                    onFavoriteToggle={() => handleFavoriteToggle(project.id)}
                    onMenuPress={() => handleMenuPress(project.id)}
                  />
                ))}
              </>
            )}
          </>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <>
            {tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol
                  name="checkmark"
                  size={64}
                  color="#DC2626"
                  style={styles.emptyIcon}
                />
                <ThemedText type="subtitle" style={styles.emptyTitle}>
                  No Favorite Tasks
                </ThemedText>
                <ThemedText style={styles.emptyDescription}>
                  Star tasks from your projects to add them here for quick access.
                </ThemedText>
                <TouchableOpacity
                  style={styles.addButtonLarge}
                  onPress={handleOpenAddModal}
                >
                  <IconSymbol name="plus" size={20} color="#DC2626" />
                  <ThemedText style={styles.addButtonText}>Add Tasks to Favorites</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.tabHeader}>
                  <ThemedText style={styles.description}>
                    Quick access to your {tasks.length} favorite{" "}
                    {tasks.length === 1 ? "task" : "tasks"}.
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.addButtonSmall}
                    onPress={handleOpenAddModal}
                  >
                    <IconSymbol name="plus" size={18} color="#DC2626" />
                  </TouchableOpacity>
                </View>
                {tasks.map((task) => (
                  <View key={task.id} style={styles.taskCard}>
                    <View style={styles.taskHeader}>
                      <View style={styles.taskTitleRow}>
                        <TouchableOpacity
                          onPress={() => handleTaskToggle(task.id)}
                          style={styles.checkbox}
                        >
                          <IconSymbol
                            name={task.completed ? "checkmark.circle.fill" : "circle"}
                            size={24}
                            color={task.completed ? "#10B981" : "#666"}
                          />
                        </TouchableOpacity>
                        <View style={styles.taskInfo}>
                          <ThemedText
                            style={[
                              styles.taskName,
                              task.completed && styles.taskNameCompleted,
                            ]}
                          >
                            {task.name}
                          </ThemedText>
                          <View style={styles.taskMeta}>
                            <View
                              style={[
                                styles.projectBadge,
                                { backgroundColor: task.projectColor || "#3b82f6" },
                              ]}
                            >
                              <ThemedText style={styles.projectBadgeText}>
                                {task.projectName || "Unknown"}
                              </ThemedText>
                            </View>
                            <ThemedText style={styles.taskMetaText}>
                              {task.priority} Priority
                            </ThemedText>
                            {task.deadline && (
                              <ThemedText style={styles.taskMetaText}>
                                Due {new Date(task.deadline).toLocaleDateString()}
                              </ThemedText>
                            )}
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleTaskFavoriteToggle(task.id)}
                        style={styles.favoriteButton}
                      >
                        <IconSymbol name="star.fill" size={20} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Add to Favorites Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Add to Favorites
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                }}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeTab}...`}
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <FlatList
              data={getFilteredAvailableItems() as any[]}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={styles.emptyModal}>
                  <ThemedText style={styles.emptyModalText}>
                    {searchQuery 
                      ? `No ${activeTab} found matching "${searchQuery}"`
                      : `All ${activeTab} are already in your favorites!`
                    }
                  </ThemedText>
                </View>
              }
              renderItem={({ item }) => {
                if (activeTab === 'projects') {
                  const project = item as ProjectWithTasks;
                  return (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleAddToFavorites(project.id)}
                    >
                      <View style={styles.modalItemInfo}>
                        <View
                          style={[styles.projectDot, { backgroundColor: project.color }]}
                        />
                        <View style={styles.modalItemText}>
                          <ThemedText style={styles.modalItemName}>
                            {project.name}
                          </ThemedText>
                          {project.description && (
                            <ThemedText style={styles.modalItemDesc} numberOfLines={1}>
                              {project.description}
                            </ThemedText>
                          )}
                        </View>
                      </View>
                      <IconSymbol name="star" size={20} color="#DC2626" />
                    </TouchableOpacity>
                  );
                } else {
                  const task = item as FavoriteTask;
                  return (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleAddToFavorites(task.id)}
                    >
                      <View style={styles.modalItemInfo}>
                        <IconSymbol 
                          name={task.completed ? "checkmark.circle.fill" : "circle"} 
                          size={20} 
                          color={task.completed ? "#10B981" : "#666"} 
                        />
                        <View style={styles.modalItemText}>
                          <ThemedText style={styles.modalItemName}>
                            {task.name}
                          </ThemedText>
                          <ThemedText style={styles.modalItemDesc}>
                            {task.projectName} • {task.priority}
                          </ThemedText>
                        </View>
                      </View>
                      <IconSymbol name="star" size={20} color="#DC2626" />
                    </TouchableOpacity>
                  );
                }
              }}
            />
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 0,
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  description: {
    marginBottom: 20,
    opacity: 0.7,
    color: colors.text,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: "center",
    color: colors.text,
  },
  emptyDescription: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 20,
    color: colors.text,
  },
  comingSoon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  comingSoonTitle: {
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
    color: colors.primary,
  },
  comingSoonText: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  // Task Card Styles
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  checkbox: {
    padding: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  projectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  projectBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  taskMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  favoriteButton: {
    padding: 4,
  },
  // Member Card Styles
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Tab content header
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  // Add button styles
  addButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 20,
  },
  addButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyModal: {
    padding: 40,
    alignItems: 'center',
  },
  emptyModalText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  modalItemText: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  modalItemDesc: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  projectDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalMemberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modalAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
