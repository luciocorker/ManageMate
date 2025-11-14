import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/contexts/ThemeContext";
import {
    getDashboardStats,
    getProjectsWithTasks,
    getRecentActivity,
    getUpcomingTasks,
} from "@/lib/supabaseService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  upcomingDeadlines: number;
}

interface Activity {
  id: string;
  type: "project" | "task";
  title: string;
  subtitle: string;
  timestamp: string;
  color: string;
}

interface UpcomingTask {
  id: string;
  name: string;
  deadline: string;
  priority: string;
  status: string;
  projectName: string;
  projectColor: string;
}

export default function DashboardPage() {
  const { colors } = useTheme();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    upcomingDeadlines: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [statsData, activitiesData, tasksData, projectsData] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(),
        getUpcomingTasks(),
        getProjectsWithTasks(),
      ]);

      console.log("Dashboard Data Loaded:");
      console.log("Stats:", statsData);
      console.log("Activities:", activitiesData);
      console.log("Upcoming Tasks:", tasksData);
      console.log("Projects:", projectsData);

      setStats(statsData);
      setActivities(activitiesData);
      setUpcomingTasks(tasksData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / 86400000);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return colors.primary;
      case "High":
        return colors.primary;
      case "Medium":
        return colors.primary;
      case "Low":
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Dashboard</ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>Dashboard</ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <IconSymbol
              name="folder.fill"
              size={24}
              color={colors.primary}
              style={styles.statIcon}
            />
            <ThemedText type="subtitle" style={styles.statValue}>
              {stats.totalProjects}
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              Total Projects
            </ThemedText>
          </View>

          <View style={styles.statCard}>
            <IconSymbol
              name="folder.fill"
              size={24}
              color={colors.primary}
              style={styles.statIcon}
            />
            <ThemedText type="subtitle" style={styles.statValue}>
              {stats.activeProjects}
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              Active
            </ThemedText>
          </View>

          <View style={styles.statCard}>
            <IconSymbol
              name="checkmark"
              size={24}
              color={colors.primary}
              style={styles.statIcon}
            />
            <ThemedText type="subtitle" style={styles.statValue}>
              {stats.completedTasks}/{stats.totalTasks}
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              Tasks Done
            </ThemedText>
          </View>

          <View style={styles.statCard}>
            <IconSymbol
              name="calendar"
              size={24}
              color={colors.primary}
              style={styles.statIcon}
            />
            <ThemedText type="subtitle" style={styles.statValue}>
              {stats.upcomingDeadlines}
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              Upcoming
            </ThemedText>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="star.fill" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Quick Actions
            </ThemedText>
          </View>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/project')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '33' }]}>
                <IconSymbol name="plus" size={28} color={colors.primary} />
              </View>
              <ThemedText style={styles.quickActionText}>New Project</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/calendar')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '33' }]}>
                <IconSymbol name="calendar" size={28} color={colors.primary} />
              </View>
              <ThemedText style={styles.quickActionText}>Calendar</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/favorites')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '33' }]}>
                <IconSymbol name="star.fill" size={28} color={colors.primary} />
              </View>
              <ThemedText style={styles.quickActionText}>Favorites</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/messaging')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '33' }]}>
                <IconSymbol name="message.fill" size={28} color={colors.primary} />
              </View>
              <ThemedText style={styles.quickActionText}>Messages</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Project Status Overview */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="folder.fill" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Project Status
              </ThemedText>
            </View>
            <View style={styles.statusOverview}>
              {['In Progress', 'Planning', 'Review', 'Completed'].map(status => {
                const count = projects.filter(p => p.status === status).length;
                const color = colors.primary;
                return count > 0 ? (
                  <View key={status} style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: color }]} />
                    <ThemedText style={styles.statusText}>{status}</ThemedText>
                    <ThemedText style={styles.statusCount}>{count}</ThemedText>
                  </View>
                ) : null;
              })}
            </View>
          </View>
        )}

        {/* Upcoming Tasks */}
        {upcomingTasks.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="clock.fill" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Upcoming Deadlines
              </ThemedText>
            </View>
            {upcomingTasks.map((task) => (
              <View
                key={task.id}
                style={styles.taskCard}
              >
                <View
                  style={[
                    styles.taskColorBar,
                    { backgroundColor: task.projectColor },
                  ]}
                />
                <View style={styles.taskContent}>
                  <View style={styles.taskHeader}>
                    <ThemedText style={styles.taskName}>{task.name}</ThemedText>
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor: `${getPriorityColor(task.priority)}20`,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.priorityText,
                          { color: getPriorityColor(task.priority) },
                        ]}
                      >
                        {task.priority}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.taskMeta}>
                    <ThemedText style={styles.taskProject}>
                      {task.projectName}
                    </ThemedText>
                    <ThemedText style={styles.taskDeadline}>
                      {formatDeadline(task.deadline)}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : stats.totalProjects > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="clock.fill" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Upcoming Deadlines
              </ThemedText>
            </View>
            <View style={styles.emptySection}>
              <IconSymbol name="clock" size={40} color={colors.primary} style={{ opacity: 0.5 }} />
              <ThemedText style={styles.emptySectionText}>
                No upcoming deadlines in the next 7 days
              </ThemedText>
            </View>
          </View>
        ) : null}

        {/* Recent Activity */}
        {activities.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="clock.arrow.circlepath" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Recent Activity
              </ThemedText>
            </View>
            <View style={styles.activityContainer}>
              {activities.map((activity, index) => (
                <View key={`${activity.type}-${activity.id}`}>
                  {index > 0 && <View style={styles.activityDivider} />}
                  <View style={styles.activityItem}>
                    <View style={styles.activityIconContainer}>
                      <IconSymbol
                        name={
                          activity.type === "project"
                            ? "folder.fill"
                            : "checkmark.circle.fill"
                        }
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <ThemedText style={styles.activityTitle}>
                        {activity.title}
                      </ThemedText>
                      <ThemedText style={styles.activitySubtitle}>
                        {activity.subtitle}
                      </ThemedText>
                      <ThemedText style={styles.activityTime}>
                        {formatDate(activity.timestamp)}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : stats.totalProjects > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="clock.arrow.circlepath" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Recent Activity
              </ThemedText>
            </View>
            <View style={styles.activityContainer}>
              <ThemedText style={styles.emptyActivityText}>
                No recent activity to show
              </ThemedText>
            </View>
          </View>
        ) : null}

        {/* Task Progress */}
        {stats.totalTasks > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Task Progress
              </ThemedText>
            </View>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <ThemedText style={styles.progressTitle}>Overall Completion</ThemedText>
                <ThemedText style={styles.progressPercentage}>
                  {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                </ThemedText>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }
                  ]} 
                />
              </View>
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <ThemedText style={styles.progressStatValue}>{stats.completedTasks}</ThemedText>
                  <ThemedText style={styles.progressStatLabel}>Completed</ThemedText>
                </View>
                <View style={styles.progressStat}>
                  <ThemedText style={styles.progressStatValue}>{stats.totalTasks - stats.completedTasks}</ThemedText>
                  <ThemedText style={styles.progressStatLabel}>Remaining</ThemedText>
                </View>
                <View style={styles.progressStat}>
                  <ThemedText style={styles.progressStatValue}>{stats.totalTasks}</ThemedText>
                  <ThemedText style={styles.progressStatLabel}>Total</ThemedText>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Empty State */}
        {stats.totalProjects === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol
              name="folder.badge.plus"
              size={64}
              color={colors.primary}
              style={styles.emptyIcon}
            />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              No Projects Yet
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              Create your first project to get started
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  taskCard: {
    flexDirection: "row",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskColorBar: {
    width: 4,
  },
  taskContent: {
    flex: 1,
    padding: 12,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
    color: colors.text,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
  },
  taskMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskProject: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  taskDeadline: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
    color: colors.text,
  },
  activitySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  activityContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  emptyActivityText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    marginBottom: 8,
    color: colors.text,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  statusOverview: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  statusCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  emptySection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  emptySectionText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 14,
    color: colors.text,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
