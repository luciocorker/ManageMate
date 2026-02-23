import { DatePickerModal } from '@/components/date-picker-modal';
import { ThemedAlert } from '@/components/themed-alert';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { supabase } from '@/lib/supabase';
import { createTask, deleteFile as deleteFileFromDb, deleteTask, getProjectById, getProjectFiles, updateTaskStatus, uploadFile } from '@/lib/supabaseService';
import { Project, ProjectFile, Task } from '@/types/project';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddFile, setShowAddFile] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [alert, setAlert] = useState<AlertConfig>({ visible: false, title: '' });

  useEffect(() => {
    loadProject();
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const projectData = await getProjectById(String(id));
      if (projectData) {
        setProject(projectData);
        setTasks(projectData.tasks || []);
      } else {
        setProject(null);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      Alert.alert('Error', 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const projectFiles = await getProjectFiles(String(id));
      setFiles(projectFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Loading project...</ThemedText>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.errorText}>Project not found</ThemedText>
      </View>
    );
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Please enter a task title',
        buttons: [{ text: 'OK' }]
      });
      return;
    }

    try {
      const newTask = await createTask(project!.id, {
        name: newTaskTitle.trim(),
        deadline: newTaskDeadline.trim() || undefined,
        assignee: newTaskAssignee.trim() || 'You',
        priority: 'Medium'
      });

      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDeadline('');
      setNewTaskAssignee('');
      setShowAddTask(false);
      setAlert({
        visible: true,
        title: 'Success',
        message: 'Task added successfully',
        buttons: [{ text: 'OK' }]
      });
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newCompleted = !task.completed;
      const newStatus = newCompleted ? 'Completed' : (task.status === 'Completed' ? 'Not Started' : task.status);

      await updateTaskStatus(taskId, newStatus, newCompleted);

      setTasks(tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            completed: newCompleted,
            status: newStatus
          };
        }
        return t;
      }));
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleTaskStatusChange = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task || task.completed || task.status !== 'Not Started') return;

      await updateTaskStatus(taskId, 'In Progress', false);

      setTasks(tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status: 'In Progress' };
        }
        return t;
      }));
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setAlert({
      visible: true,
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
              setTasks(tasks.filter(t => t.id !== taskId));
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
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

  const handleAddFile = async () => {
    try {
      setUploadingFile(true);
      
      // Pick a file
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setUploadingFile(false);
        return;
      }

      const file = result.assets[0];
      
      // Upload file
      const uploadedFile = await uploadFile(
        project!.id,
        file.uri,
        file.name,
        file.mimeType || 'application/octet-stream',
        file.size || 0
      );

      // Add to local state
      setFiles([uploadedFile, ...files]);
      
      setAlert({
        visible: true,
        title: 'Success',
        message: `File "${file.name}" uploaded successfully`,
        buttons: [{ text: 'OK' }]
      });
      
      setShowAddFile(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = (file: ProjectFile) => {
    setAlert({
      visible: true,
      title: 'Delete File',
      message: `Are you sure you want to delete "${file.fileName}"?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFileFromDb(file.id, file.filePath);
              setFiles(files.filter(f => f.id !== file.id));
              Alert.alert('Success', 'File deleted successfully');
            } catch (error) {
              console.error('Error deleting file:', error);
              Alert.alert('Error', 'Failed to delete file');
            }
          },
        },
      ]
    });
  };

  const handleOpenFile = async (file: ProjectFile) => {
    try {
      // Get the file URL from Supabase Storage
      const { data } = supabase.storage
        .from('project-files')
        .getPublicUrl(file.filePath);
      
      const url = data.publicUrl;

      // Download and share the file on mobile
      Alert.alert(
        'Download File',
        `Download "${file.fileName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              try {
                if (Platform.OS === 'web') {
                  // On web, open in new tab
                  window.open(url, '_blank');
                } else {
                  // On mobile, download to temp directory and share
                  const cacheDir = (FileSystem as any).cacheDirectory || '';
                  const fileUri = cacheDir + file.fileName;
                  const downloadResult = await FileSystem.downloadAsync(url, fileUri);
                  
                  // Share the downloaded file
                  if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(downloadResult.uri, {
                      dialogTitle: 'Save file',
                    });
                  } else {
                    // Fallback: just open the URL
                    await Linking.openURL(url);
                  }
                }
              } catch (downloadError) {
                console.error('Error downloading file:', downloadError);
                Alert.alert('Error', 'Failed to download file. Opening in browser instead...');
                await Linking.openURL(url);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error handling file:', error);
      Alert.alert('Error', 'Failed to process file');
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const calculatedProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/project')} style={styles.backButton}>
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
            <ThemedText style={styles.progressText}>{calculatedProgress}%</ThemedText>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${calculatedProgress}%`, backgroundColor: '#DC2626' }]} />
          </View>

          <ThemedText style={styles.progressNote}>
            Based on task completion ({completedTasks}/{totalTasks} tasks completed)
          </ThemedText>
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
              
              {/* Deadline Picker */}
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <IconSymbol name="calendar" size={20} color="#999" />
                <ThemedText style={styles.datePickerText}>
                  {newTaskDeadline || 'Select Deadline (Optional)'}
                </ThemedText>
                {newTaskDeadline && (
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      setNewTaskDeadline('');
                    }}
                    style={styles.clearDateButton}
                  >
                    <IconSymbol name="xmark" size={16} color="#999" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              
              {/* Assignee Picker */}
              <View style={styles.assigneeContainer}>
                <ThemedText style={styles.assigneeLabel}>Assign to team member (defaults to You):</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assigneeScroll}>
                  {project.team?.map((member) => (
                    <TouchableOpacity 
                      key={member}
                      style={[styles.assigneeChip, newTaskAssignee === member && styles.assigneeChipSelected]}
                      onPress={() => setNewTaskAssignee(member)}
                    >
                      <ThemedText style={[styles.assigneeChipText, newTaskAssignee === member && styles.assigneeChipTextSelected]}>
                        {member}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
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
                <View style={styles.taskContent}>
                  <View style={styles.taskHeader}>
                    <ThemedText style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                      {task.name}
                    </ThemedText>
                    {!task.completed && task.status === 'Not Started' && (
                      <TouchableOpacity 
                        style={styles.statusButton}
                        onPress={() => handleTaskStatusChange(task.id)}
                      >
                        <ThemedText style={styles.statusButtonText}>
                          Start
                        </ThemedText>
                      </TouchableOpacity>
                    )}
                    {!task.completed && task.status === 'In Progress' && (
                      <View style={styles.taskStatusBadge}>
                        <ThemedText style={styles.taskStatusBadgeText}>
                          In Progress
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  {task.deadline && (
                    <ThemedText style={styles.taskDeadline}>
                      Due: {task.deadline}
                    </ThemedText>
                  )}
                  {task.assignee && (
                    <ThemedText style={styles.taskAssignee}>
                      Assigned to: {task.assignee}
                    </ThemedText>
                  )}
                </View>
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
            <TouchableOpacity onPress={handleAddFile} disabled={uploadingFile}>
              <IconSymbol name="plus" size={24} color={uploadingFile ? "#666" : "#DC2626"} />
            </TouchableOpacity>
          </View>

          {uploadingFile && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#DC2626" />
              <ThemedText style={styles.uploadingText}>Uploading file...</ThemedText>
            </View>
          )}

          {files.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              No files uploaded yet. Tap + to upload files.
            </ThemedText>
          ) : (
            files.map((file) => (
              <View key={file.id} style={styles.fileItem}>
                <TouchableOpacity 
                  style={styles.fileIconContainer}
                  onPress={() => handleOpenFile(file)}
                >
                  <IconSymbol name="doc.fill" size={24} color="#DC2626" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.fileContent}
                  onPress={() => handleOpenFile(file)}
                >
                  <ThemedText style={styles.fileName}>{file.fileName}</ThemedText>
                  <ThemedText style={styles.fileSize}>
                    {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'} • {new Date(file.createdAt).toLocaleDateString()}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteFile(file)}>
                  <IconSymbol name="trash" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))
          )}
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
      
      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={(date) => setNewTaskDeadline(date)}
        selectedDate={newTaskDeadline}
        projects={project ? [{ ...project, tasks }] : []}
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
  progressNote: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
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
  datePickerButton: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  datePickerText: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
  clearDateButton: {
    padding: 4,
  },
  assigneeContainer: {
    gap: 8,
  },
  assigneeLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  assigneeScroll: {
    flexGrow: 0,
  },
  assigneeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  assigneeChipSelected: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  assigneeChipText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  assigneeChipTextSelected: {
    color: 'white',
    fontWeight: '600',
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
  taskContent: {
    flex: 1,
    gap: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
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
  statusButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  statusButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
  },
  taskStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#DC2626',
  },
  taskStatusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  taskDeadline: {
    fontSize: 12,
    color: '#999',
  },
  taskAssignee: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadingText: {
    fontSize: 14,
    color: '#999',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    gap: 12,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileContent: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#999',
  },
});
