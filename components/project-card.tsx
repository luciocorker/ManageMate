import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { Project } from '@/types/project';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  onFavoriteToggle: () => void;
  onMenuPress: () => void;
}

export function ProjectCard({ project, onPress, onFavoriteToggle, onMenuPress }: ProjectCardProps) {
  const { colors } = useTheme();
  const iconColor = colors.textSecondary;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return colors.border;
      case 'In Progress': return colors.primary;
      case 'Review': return colors.primary;
      case 'Testing': return colors.primary;
      case 'Completed': return colors.border;
      case 'Paused': return colors.border;
      case 'Archived': return colors.border;
      default: return colors.border;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return colors.primary;
      case 'High': return colors.primary;
      case 'Medium': return colors.border;
      case 'Low': return colors.border;
      default: return colors.border;
    }
  };

  const getBadgeTextColor = (bgColor: string) => {
    // For primary color badges (red), use white text for contrast
    // For border color badges (gray), use main text color
    if (bgColor === colors.primary) {
      return '#FFFFFF'; // Always white on red badges for maximum contrast
    }
    return colors.text; // Black in light mode, white in dark mode
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
        lightColor={colors.card}
        darkColor={colors.card}
      >
        {/* Header Row */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.colorDot, { backgroundColor: colors.primary }]} />
            <ThemedText style={[styles.projectName, { color: colors.text }]} numberOfLines={1}>
              {project.name}
            </ThemedText>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={onFavoriteToggle} style={styles.iconButton}>
              <IconSymbol 
                name={project.isFavorite ? 'star.fill' : 'star'} 
                size={20} 
                color={project.isFavorite ? colors.primary : iconColor} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
              <IconSymbol name="ellipsis" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        {project.description && (
          <ThemedText style={[styles.description, { color: colors.text }]} numberOfLines={2}>
            {project.description}
          </ThemedText>
        )}

        {/* Status and Priority Badges */}
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getStatusColor(project.status) }]}>
            <Text style={[styles.badgeText, { color: getBadgeTextColor(getStatusColor(project.status)) }]}>{project.status}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(project.priority) }]}>
            <Text style={[styles.badgeText, { color: getBadgeTextColor(getPriorityColor(project.priority)) }]}>{project.priority}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${project.progress}%`, backgroundColor: colors.primary }
              ]} 
            />
          </View>
          <ThemedText style={[styles.progressText, { color: colors.text }]}>{project.progress}%</ThemedText>
        </View>

        {/* Stats Row */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <IconSymbol name="checkmark" size={16} color={iconColor} />
            <ThemedText style={[styles.statText, { color: colors.text }]}>
              {completedTasks}/{totalTasks} tasks
            </ThemedText>
          </View>
          <View style={styles.stat}>
            <IconSymbol name="person.fill" size={16} color={iconColor} />
            <ThemedText style={[styles.statText, { color: colors.text }]}>
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
                { color: colors.text },
                deadline.isOverdue && styles.overdueText
              ]}
            >
              {deadline.formatted}
            </ThemedText>
          </View>
          {project.budget && (
            <ThemedText style={[styles.budget, { color: colors.text }]}>
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
