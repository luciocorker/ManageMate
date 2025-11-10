import { ThemedAlert } from '@/components/themed-alert';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getProjectsWithTasks } from '@/data/mockData';
import { Project, Task } from '@/types/project';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddFile, setShowAddFile] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [alert, setAlert] = useState<AlertConfig>({ visible: false, title: '' });

  useEffect(() => {
    const projects = getProjectsWithTasks();
    const foundProject = projects.find(p => p.id === Number(id));
    if (foundProject) {
      setProject(foundProject);
      setTasks(foundProject.tasks || []);
    }
  }, [id]);

  if (!project) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.errorText}>Project not found</ThemedText>
      </View>
    );
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Please enter a task title',
        buttons: [{ text: 'OK' }]
      });
      return;
    }

    const newTask: Task = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      projectId: project.id,
      name: newTaskTitle.trim(),
      priority: 'Medium',
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setShowAddTask(false);
    setAlert({
      visible: true,
      title: 'Success',
      message: 'Task added successfully',
      buttons: [{ text: 'OK' }]
    });
  };

  const handleToggleTask = (taskId: number) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleDeleteTask = (taskId: number) => {
    setAlert({
      visible: true,
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setTasks(tasks.filter(t => t.id !== taskId)),
        },
      ]
    });
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Please enter a member name',
        buttons: [{ text: 'OK' }]
      });
      return;
    }

    const updatedTeam = [...(project.team || []), newMemberName.trim()];
    setProject({ ...project, team: updatedTeam });
    setNewMemberName('');
    setShowAddMember(false);
    setAlert({
      visible: true,
      title: 'Success',
      message: 'Team member added successfully',
      buttons: [{ text: 'OK' }]
    });
  };

  const handleRemoveMember = (memberName: string) => {
    setAlert({
      visible: true,
      title: 'Remove Member',
      message: `Remove ${memberName} from the team?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedTeam = (project.team || []).filter(m => m !== memberName);
            setProject({ ...project, team: updatedTeam });
          },
        },
      ]
    });
  };

  const handleAddFile = () => {
    if (!newFileName.trim()) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Please enter a file name',
        buttons: [{ text: 'OK' }]
      });
      return;
    }

    setAlert({
      visible: true,
      title: 'Success',
      message: `File "${newFileName}" would be added here`,
      buttons: [{ text: 'OK' }]
    });
    setNewFileName('');
    setShowAddFile(false);
  };

  const handleUpdateProgress = (increment: number) => {
    const newProgress = Math.max(0, Math.min(100, project.progress + increment));
    setProject({ ...project, progress: newProgress });
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{project.name}</ThemedText>
        <TouchableOpacity style={styles.menuButton}>
          <IconSymbol name="ellipsis" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Project Info */}
        <ThemedView style={styles.section} lightColor="#1e1e1e" darkColor="#1e1e1e">
          <ThemedText style={styles.sectionTitle}>Project Information</ThemedText>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Status</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: project.status === 'In Progress' || project.status === 'Review' ? '#DC2626' : '#2a2a2a' }]}>
              <ThemedText style={styles.statusText}>{project.status}</ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Priority</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: project.priority === 'High' || project.priority === 'Critical' ? '#DC2626' : '#2a2a2a' }]}>
              <ThemedText style={styles.statusText}>{project.priority}</ThemedText>
            </View>
          </View>

          {project.deadline && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Deadline</ThemedText>
              <ThemedText style={styles.infoValue}>{project.deadline}</ThemedText>
            </View>
          )}

          {project.budget && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Budget</ThemedText>
              <ThemedText style={styles.infoValue}>${project.budget.toLocaleString()}</ThemedText>
            </View>
          )}

          {project.description && (
            <View style={styles.descriptionContainer}>
              <ThemedText style={styles.infoLabel}>Description</ThemedText>
              <ThemedText style={styles.description}>{project.description}</ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Progress Tracker */}
        <ThemedView style={styles.section} lightColor="#1e1e1e" darkColor="#1e1e1e">
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Progress</ThemedText>
            <ThemedText style={styles.progressText}>{project.progress}%</ThemedText>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${project.progress}%`, backgroundColor: '#DC2626' }]} />
          </View>

          <View style={styles.progressControls}>
            <TouchableOpacity 
              style={styles.progressButton}
              onPress={() => handleUpdateProgress(-10)}
            >
              <IconSymbol name="minus" size={20} color="#fff" />
              <ThemedText style={styles.progressButtonText}>-10%</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.progressButton}
              onPress={() => handleUpdateProgress(-5)}
            >
              <ThemedText style={styles.progressButtonText}>-5%</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.progressButton}
              onPress={() => handleUpdateProgress(5)}
            >
              <ThemedText style={styles.progressButtonText}>+5%</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.progressButton}
              onPress={() => handleUpdateProgress(10)}
            >
              <IconSymbol name="plus" size={20} color="#fff" />
              <ThemedText style={styles.progressButtonText}>+10%</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Tasks Section */}
        <ThemedView style={styles.section} lightColor="#1e1e1e" darkColor="#1e1e1e">
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Tasks ({completedTasks}/{totalTasks})
            </ThemedText>
            <TouchableOpacity onPress={() => setShowAddTask(!showAddTask)}>
              <IconSymbol name={showAddTask ? "xmark" : "plus"} size={24} color="#DC2626" />
            </TouchableOpacity>
          </View>

          {showAddTask && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder="Enter task title"
                placeholderTextColor="#999"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />
              <TouchableOpacity style={styles.addButtonSmall} onPress={handleAddTask}>
                <ThemedText style={styles.addButtonText}>Add Task</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {tasks.length === 0 ? (
            <ThemedText style={styles.emptyText}>No tasks yet. Add your first task!</ThemedText>
          ) : (
            tasks.map(task => (
              <View key={task.id} style={styles.taskItem}>
                <TouchableOpacity 
                  onPress={() => handleToggleTask(task.id)}
                  style={styles.taskCheckbox}
                >
                  <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
                    {task.completed && <IconSymbol name="checkmark" size={16} color="#fff" />}
                  </View>
                </TouchableOpacity>
                <ThemedText style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                  {task.name}
                </ThemedText>
                <TouchableOpacity onPress={() => handleDeleteTask(task.id)}>
                  <IconSymbol name="trash" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ThemedView>

        {/* Team Members Section */}
        <ThemedView style={styles.section} lightColor="#1e1e1e" darkColor="#1e1e1e">
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Team Members ({project.team?.length || 0})
            </ThemedText>
            <TouchableOpacity onPress={() => setShowAddMember(!showAddMember)}>
              <IconSymbol name={showAddMember ? "xmark" : "plus"} size={24} color="#DC2626" />
            </TouchableOpacity>
          </View>

          {showAddMember && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder="Enter member name"
                placeholderTextColor="#999"
                value={newMemberName}
                onChangeText={setNewMemberName}
              />
              <TouchableOpacity style={styles.addButtonSmall} onPress={handleAddMember}>
                <ThemedText style={styles.addButtonText}>Add Member</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {(!project.team || project.team.length === 0) ? (
            <ThemedText style={styles.emptyText}>No team members yet. Add someone!</ThemedText>
          ) : (
            project.team.map((member, index) => (
              <View key={index} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  <ThemedText style={styles.memberInitial}>
                    {member.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
                <ThemedText style={styles.memberName}>{member}</ThemedText>
                <TouchableOpacity onPress={() => handleRemoveMember(member)}>
                  <IconSymbol name="trash" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ThemedView>

        {/* Files Section */}
        <ThemedView style={styles.section} lightColor="#1e1e1e" darkColor="#1e1e1e">
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Files & Attachments</ThemedText>
            <TouchableOpacity onPress={() => setShowAddFile(!showAddFile)}>
              <IconSymbol name={showAddFile ? "xmark" : "plus"} size={24} color="#DC2626" />
            </TouchableOpacity>
          </View>

          {showAddFile && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder="Enter file name"
                placeholderTextColor="#999"
                value={newFileName}
                onChangeText={setNewFileName}
              />
              <TouchableOpacity style={styles.addButtonSmall} onPress={handleAddFile}>
                <ThemedText style={styles.addButtonText}>Add File</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          <ThemedText style={styles.emptyText}>
            File upload functionality coming soon
          </ThemedText>
        </ThemedView>
      </ScrollView>

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
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  menuButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  descriptionContainer: {
    marginTop: 12,
    paddingTop: 12,
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    lineHeight: 20,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  progressControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  progressButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  progressButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  addForm: {
    marginBottom: 16,
    gap: 12,
  },
  input: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: 'white',
  },
  addButtonSmall: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    gap: 12,
  },
  taskCheckbox: {
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  taskTitleCompleted: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    gap: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 100,
  },
});
