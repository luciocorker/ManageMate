import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Project, Task } from '@/types/project';
import { useMemo, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  selectedDate?: string;
  projects?: Project[]; // Optional projects data for showing due dates
}

export function DatePickerModal({ visible, onClose, onSelectDate, selectedDate, projects = [] }: DatePickerModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get all tasks with deadlines and projects with deadlines
  const dueDates = useMemo(() => {
    const dates: { [key: string]: { tasks: Task[], projects: Project[] } } = {};
    
    projects.forEach(project => {
      // Add project deadline
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
          const dateKey = task.deadline;
          if (!dates[dateKey]) {
            dates[dateKey] = { tasks: [], projects: [] };
          }
          dates[dateKey].tasks.push(task);
        }
      });
    });
    
    return dates;
  }, [projects]);
  
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
  
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${month}-${dayStr}`;
    
    return selectedDate === dateKey;
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
  
  const handleSelectDate = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${month}-${dayStr}`;
    
    onSelectDate(dateKey);
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
      const selected = isSelected(day);
      const hasDue = hasDueItems(day);
      const { projectCount, taskCount } = getDueItemsByType(day);
      
      days.push(
        <TouchableOpacity 
          key={`day-${day}`} 
          style={styles.dayCell}
          onPress={() => handleSelectDate(day)}
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Select Date</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.calendarContainer}>
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
                <IconSymbol name="chevron.left" size={24} color="#fff" />
              </TouchableOpacity>
              
              <ThemedText style={styles.monthYear}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </ThemedText>
              
              <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                <IconSymbol name="chevron.right" size={24} color="#fff" />
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
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                onSelectDate('');
                onClose();
              }}
            >
              <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={onClose}
            >
              <ThemedText style={styles.doneButtonText}>Done</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  calendarContainer: {
    padding: 16,
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
    backgroundColor: '#2a2a2a',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  dayOfWeekCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayOfWeekText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#999',
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
    backgroundColor: '#2a2a2a',
    position: 'relative',
  },
  todayContent: {
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  selectedContent: {
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  dayText: {
    fontSize: 14,
    color: 'white',
  },
  activeDayText: {
    color: '#fff',
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
    borderColor: '#1e1e1e',
  },
  projectIndicator: {
    backgroundColor: '#DC2626',
  },
  taskIndicator: {
    backgroundColor: '#999',
  },
  dueIndicatorText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 9,
  },
  emptyDay: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  doneButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
