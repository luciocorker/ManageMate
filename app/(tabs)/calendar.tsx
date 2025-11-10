import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
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
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell}>
          <ThemedText style={styles.emptyDay}></ThemedText>
        </View>
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <TouchableOpacity key={`day-${day}`} style={styles.dayCell}>
          <View style={[
            styles.dayContent, 
            isToday(day) && { backgroundColor: tintColor }
          ]}>
            <ThemedText style={[
              styles.dayText, 
              isToday(day) && styles.todayText
            ]}>
              {day}
            </ThemedText>
          </View>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>Calendar</ThemedText>
        
        <ThemedView 
          style={styles.calendarContainer}
          lightColor="#f5f5f5"
          darkColor="#1f1f1f"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
              <ThemedText style={styles.navButtonText}>{'<'}</ThemedText>
            </TouchableOpacity>
            
            <ThemedText type="subtitle" style={styles.monthYear}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </ThemedText>
            
            <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
              <ThemedText style={styles.navButtonText}>{'>'}</ThemedText>
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
        </ThemedView>
        
        <View style={styles.eventsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Upcoming Events
          </ThemedText>
          <ThemedText style={styles.description}>
            No events scheduled for this month.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 16,
  },
  calendarContainer: {
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 12,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  navButton: {
    padding: 10,
    minWidth: 40,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  monthYear: {
    fontSize: 20,
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayOfWeekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayOfWeekText: {
    fontWeight: '600',
    fontSize: 12,
    opacity: 0.7,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  dayContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
  },
  emptyDay: {
    opacity: 0,
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  eventsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  description: {
    opacity: 0.7,
  },
});
