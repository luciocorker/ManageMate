import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { getProjectsWithTasks } from '@/lib/supabaseService';
import { Project, Task } from '@/types/project';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Helper function to get status badge background color
const getStatusBadgeStyle = (status: string) => {
  const statusColors: { [key: string]: any } = {
    'Planning': { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6' },
    'In Progress': { backgroundColor: 'rgba(234, 179, 8, 0.2)', borderColor: '#eab308' },
    'Review': { backgroundColor: 'rgba(168, 85, 247, 0.2)', borderColor: '#a855f7' },
    'Testing': { backgroundColor: 'rgba(249, 115, 22, 0.2)', borderColor: '#f97316' },
    'Completed': { backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: '#22c55e' },
    'Paused': { backgroundColor: 'rgba(107, 114, 128, 0.2)', borderColor: '#6b7280' },
    'Archived': { backgroundColor: 'rgba(75, 85, 99, 0.2)', borderColor: '#4b5563' },
    'Not Started': { backgroundColor: 'rgba(156, 163, 175, 0.2)', borderColor: '#9ca3af' },
  };
  return statusColors[status] || statusColors['Planning'];
};

// Helper function to get status text color
const getStatusTextStyle = (status: string) => {
  const statusColors: { [key: string]: any } = {
    'Planning': { color: '#3b82f6' },
    'In Progress': { color: '#eab308' },
    'Review': { color: '#a855f7' },
    'Testing': { color: '#f97316' },
    'Completed': { color: '#22c55e' },
    'Paused': { color: '#6b7280' },
    'Archived': { color: '#4b5563' },
    'Not Started': { color: '#9ca3af' },
  };
  return statusColors[status] || statusColors['Planning'];
};

export default function CalendarScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  
  // Load projects and user info from Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Get user profile for name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profile?.full_name) {
          setCurrentUserName(profile.full_name);
        }
      }
      
      // Get all projects (owned + member)
      const data = await getProjectsWithTasks();
      setProjects(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Get all tasks with deadlines and projects with deadlines
  // Filter: Show all tasks from owned projects, only assigned tasks from member projects
  const dueDates = useMemo(() => {
    const dates: { [key: string]: { tasks: Task[], projects: Project[] } } = {};
    
    projects.forEach(project => {
      const isOwner = project.ownerId === currentUserId;
      
      // Add project deadline (all projects shown)
      if (project.deadline) {
        const dateKey = project.deadline;
        if (!dates[dateKey]) {
          dates[dateKey] = { tasks: [], projects: [] };
        }
        dates[dateKey].projects.push(project);
      }
      
      // Add task deadlines
      project.tasks?.forEach(task => {
        if (task.deadline) {
          // If owner: show all tasks
          // If member: show only tasks assigned to them
          const shouldShowTask = isOwner || task.assignee === currentUserName;
          
          if (shouldShowTask) {
            const dateKey = task.deadline;
            if (!dates[dateKey]) {
              dates[dateKey] = { tasks: [], projects: [] };
            }
            dates[dateKey].tasks.push(task);
          }
        }
      });
    });
    
    return dates;
  }, [projects, currentUserId, currentUserName]);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return { firstDay, daysInMonth };
  };
  
  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };
  
  const hasDueItems = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${month}-${dayStr}`;
    
    return dueDates[dateKey] && (dueDates[dateKey].tasks.length > 0 || dueDates[dateKey].projects.length > 0);
  };
  
  const getDueItemsByType = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${month}-${dayStr}`;
    
    if (!dueDates[dateKey]) return { projectCount: 0, taskCount: 0 };
    return {
      projectCount: dueDates[dateKey].projects.length,
      taskCount: dueDates[dateKey].tasks.length,
    };
  };
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell}>
          <View style={styles.emptyDay} />
        </View>
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const today = isToday(day);
      const selected = selectedDay === day;
      const hasDue = hasDueItems(day);
      const { projectCount, taskCount } = getDueItemsByType(day);
      
      days.push(
        <TouchableOpacity 
          key={`day-${day}`} 
          style={styles.dayCell}
          onPress={() => setSelectedDay(day)}
        >
          <View style={[
            styles.dayContent, 
            today && styles.todayContent,
            selected && styles.selectedContent
          ]}>
            <ThemedText style={[
              styles.dayText, 
              (today || selected) && styles.activeDayText
            ]}>
              {day}
            </ThemedText>
            {hasDue && (
              <View style={styles.dueIndicatorContainer}>
                {projectCount > 0 && (
                  <View style={[styles.dueIndicator, styles.projectIndicator]}>
                    <ThemedText style={styles.dueIndicatorText}>{projectCount}</ThemedText>
                  </View>
                )}
                {taskCount > 0 && (
                  <View style={[styles.dueIndicator, styles.taskIndicator]}>
                    <ThemedText style={styles.dueIndicatorText}>{taskCount}</ThemedText>
                  </View>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const styles = createStyles(colors);

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Calendar</ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.loadingText}>Loading calendar...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>Calendar</ThemedText>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.calendarContainer}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
              <IconSymbol name="chevron.left" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <ThemedText style={styles.monthYear}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </ThemedText>
            
            <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
              <IconSymbol name="chevron.right" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.daysOfWeekContainer}>
            {daysOfWeek.map((day) => (
              <View key={day} style={styles.dayOfWeekCell}>
                <ThemedText style={styles.dayOfWeekText}>{day}</ThemedText>
              </View>
            ))}
          </View>
          
          <View style={styles.calendarGrid}>
            {renderCalendarDays()}
          </View>
        </View>
        
        <View style={styles.eventsSection}>
          <ThemedText style={styles.sectionTitle}>
            {selectedDay ? `Events on ${monthNames[currentDate.getMonth()]} ${selectedDay}` : 'Upcoming Events'}
          </ThemedText>
          {selectedDay ? (
            (() => {
              const year = currentDate.getFullYear();
              const month = String(currentDate.getMonth() + 1).padStart(2, '0');
              const dayStr = String(selectedDay).padStart(2, '0');
              const dateKey = `${year}-${month}-${dayStr}`;
              const dayItems = dueDates[dateKey];
              
              if (!dayItems || (dayItems.tasks.length === 0 && dayItems.projects.length === 0)) {
                return (
                  <View style={styles.emptyEventsContainer}>
                    <ThemedText style={styles.emptyEventsText}>
                      No due items for this day
                    </ThemedText>
                  </View>
                );
              }
              
              return (
                <View style={styles.eventsContainer}>
                  {dayItems.projects.length > 0 && (
                    <View style={styles.eventCategory}>
                      <ThemedText style={styles.categoryTitle}>Projects Due</ThemedText>
                      {dayItems.projects.map(project => (
                        <TouchableOpacity 
                          key={`project-${project.id}`} 
                          style={styles.eventItem}
                          onPress={() => router.push(`/(tabs)/project/${project.id}`)}
                        >
                          <View style={styles.projectIconContainer}>
                            <IconSymbol name="folder" size={20} color={colors.primary} />
                          </View>
                          <View style={styles.eventContent}>
                            <View style={styles.eventTitleRow}>
                              <ThemedText style={styles.eventTitle}>{project.name}</ThemedText>
                              <View style={[styles.statusBadge, getStatusBadgeStyle(project.status)]}>
                                <ThemedText style={[styles.statusBadgeText, getStatusTextStyle(project.status)]}>
                                  {project.status.toUpperCase()}
                                </ThemedText>
                              </View>
                            </View>
                            <ThemedText style={styles.eventSubtitle}>
                              {project.priority} Priority
                            </ThemedText>
                          </View>
                          <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  {dayItems.tasks.length > 0 && (
                    <View style={styles.eventCategory}>
                      <ThemedText style={styles.categoryTitle}>Tasks Due</ThemedText>
                      {dayItems.tasks.map(task => (
                        <TouchableOpacity 
                          key={`task-${task.id}`} 
                          style={styles.eventItem}
                          onPress={() => router.push(`/(tabs)/project/${task.projectId}`)}
                        >
                          <View style={styles.taskIconContainer}>
                            <IconSymbol name="checkmark.circle" size={20} color={colors.textSecondary} />
                          </View>
                          <View style={styles.eventContent}>
                            <View style={styles.eventTitleRow}>
                              <ThemedText style={styles.eventTitle}>{task.name}</ThemedText>
                              <View style={[styles.statusBadge, getStatusBadgeStyle(task.status)]}>
                                <ThemedText style={[styles.statusBadgeText, getStatusTextStyle(task.status)]}>
                                  {task.status.toUpperCase()}
                                </ThemedText>
                              </View>
                            </View>
                            <ThemedText style={styles.eventSubtitle}>
                              {task.priority} Priority
                              {task.assignee && ` • Assigned to: ${task.assignee === currentUserName ? 'you' : task.assignee}`}
                            </ThemedText>
                          </View>
                          <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })()
          ) : (
            <View style={styles.emptyEventsContainer}>
              <ThemedText style={styles.emptyEventsText}>
                Select a day to view events
              </ThemedText>
            </View>
          )}
        </View>
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
  calendarContainer: {
    margin: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayOfWeekCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayOfWeekText: {
    fontWeight: '600',
    fontSize: 12,
    color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 3,
  },
  dayContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.border,
    position: 'relative',
  },
  todayContent: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectedContent: {
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
  },
  activeDayText: {
    color: colors.card,
    fontWeight: 'bold',
  },
  dueIndicatorContainer: {
    position: 'absolute',
    top: -6,
    right: -6,
    flexDirection: 'row',
    gap: 4,
  },
  dueIndicator: {
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  projectIndicator: {
    backgroundColor: colors.primary,
  },
  taskIndicator: {
    backgroundColor: colors.textSecondary,
  },
  dueIndicatorText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.card,
    textAlign: 'center',
    lineHeight: 9,
  },
  emptyDay: {
    flex: 1,
  },
  eventsSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  eventsContainer: {
    gap: 16,
  },
  eventCategory: {
    gap: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  projectIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  eventContent: {
    flex: 1,
    gap: 4,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  projectBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  projectBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  taskBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  taskBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  eventSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyEventsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyEventsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
