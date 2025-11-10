import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Project } from '@/types/project';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  onFavoriteToggle: () => void;
  onMenuPress: () => void;
}

export function ProjectCard({ project, onPress, onFavoriteToggle, onMenuPress }: ProjectCardProps) {
  const iconColor = useThemeColor({}, 'icon');
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return '#6b7280';
      case 'In Progress': return '#3b82f6';
      case 'Review': return '#f59e0b';
      case 'Testing': return '#8b5cf6';
      case 'Completed': return '#10b981';
      case 'Paused': return '#ef4444';
      case 'Archived': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return { formatted: 'No deadline', isOverdue: false };
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now && project.status !== 'Completed';
    
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return { formatted, isOverdue };
  };

  const deadline = formatDate(project.deadline);
  const completedTasks = project.tasks?.filter(t => t.completed).length || 0;
  const totalTasks = project.tasks?.length || 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView 
        style={styles.card}
        lightColor="#f9fafb"
        darkColor="#1f2937"
      >
        {/* Header Row */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.colorDot, { backgroundColor: project.color }]} />
            <ThemedText style={styles.projectName} numberOfLines={1}>
              {project.name}
            </ThemedText>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={onFavoriteToggle} style={styles.iconButton}>
              <IconSymbol 
                name={project.isFavorite ? 'star.fill' : 'star'} 
                size={20} 
                color={project.isFavorite ? '#f59e0b' : iconColor} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
              <IconSymbol name="ellipsis" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        {project.description && (
          <ThemedText style={styles.description} numberOfLines={2}>
            {project.description}
          </ThemedText>
        )}

        {/* Status and Priority Badges */}
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getStatusColor(project.status) }]}>
            <Text style={styles.badgeText}>{project.status}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(project.priority) }]}>
            <Text style={styles.badgeText}>{project.priority}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${project.progress}%`, backgroundColor: project.color }
              ]} 
            />
          </View>
          <ThemedText style={styles.progressText}>{project.progress}%</ThemedText>
        </View>

        {/* Stats Row */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <IconSymbol name="checkmark" size={16} color={iconColor} />
            <ThemedText style={styles.statText}>
              {completedTasks}/{totalTasks} tasks
            </ThemedText>
          </View>
          <View style={styles.stat}>
            <IconSymbol name="person.fill" size={16} color={iconColor} />
            <ThemedText style={styles.statText}>
              {project.team.length} members
            </ThemedText>
          </View>
        </View>

        {/* Deadline and Budget */}
        <View style={styles.footer}>
          <View style={styles.stat}>
            <IconSymbol name="calendar" size={16} color={iconColor} />
            <ThemedText 
              style={[
                styles.statText, 
                deadline.isOverdue && styles.overdueText
              ]}
            >
              {deadline.formatted}
            </ThemedText>
          </View>
          {project.budget && (
            <ThemedText style={styles.budget}>
              ${project.budget.toLocaleString()}
            </ThemedText>
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  iconButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budget: {
    fontSize: 14,
    fontWeight: '600',
  },
  overdueText: {
    color: '#ef4444',
  },
});
