import { DatePickerModal } from '@/components/date-picker-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProjectPriority, ProjectStatus } from '@/types/project';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateProject: (projectData: ProjectFormData) => void;
}

export interface ProjectFormData {
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  deadline: string;
  budget: string;
  team: string[];
}

export function CreateProjectModal({ visible, onClose, onCreateProject }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Planning');
  const [priority, setPriority] = useState<ProjectPriority>('Medium');
  const [deadline, setDeadline] = useState('');
  const [budget, setBudget] = useState('');
  const [teamMember, setTeamMember] = useState('');
  const [team, setTeam] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const statuses: ProjectStatus[] = ['Planning', 'In Progress', 'Review', 'Testing', 'Completed', 'Paused', 'Archived'];
  const priorities: ProjectPriority[] = ['Low', 'Medium', 'High', 'Critical'];

  const handleAddTeamMember = () => {
    if (teamMember.trim()) {
      setTeam([...team, teamMember.trim()]);
      setTeamMember('');
    }
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeam(team.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    onCreateProject({
      name: name.trim(),
      description: description.trim(),
      status,
      priority,
      deadline,
      budget,
      team,
    });

    // Reset form
    setName('');
    setDescription('');
    setStatus('Planning');
    setPriority('Medium');
    setDeadline('');
    setBudget('');
    setTeam([]);
    setTeamMember('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modal} lightColor="#1e1e1e" darkColor="#1e1e1e">
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>Create New Project</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Project Name */}
            <View style={styles.field}>
              <ThemedText style={styles.label}>Project Name *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter project name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Description */}
            <View style={styles.field}>
              <ThemedText style={styles.label}>Description</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter project description"
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Status */}
            <View style={styles.field}>
              <ThemedText style={styles.label}>Status</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                {statuses.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.optionButton, status === s && styles.optionButtonActive]}
                    onPress={() => setStatus(s)}
                  >
                    <ThemedText style={[styles.optionText, status === s && styles.optionTextActive]}>
                      {s}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Priority */}
            <View style={styles.field}>
              <ThemedText style={styles.label}>Priority</ThemedText>
              <View style={styles.optionsRow}>
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.optionButton, priority === p && styles.optionButtonActive]}
                    onPress={() => setPriority(p)}
                  >
                    <ThemedText style={[styles.optionText, priority === p && styles.optionTextActive]}>
                      {p}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Deadline */}
            <View style={styles.field}>
              <ThemedText style={styles.label}>Deadline</ThemedText>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <IconSymbol name="calendar" size={20} color="#999" />
                <ThemedText style={styles.datePickerText}>
                  {deadline || 'Select Deadline'}
                </ThemedText>
                {deadline && (
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      setDeadline('');
                    }}
                    style={styles.clearDateButton}
                  >
                    <IconSymbol name="xmark" size={16} color="#999" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>

            {/* Budget */}
            <View style={styles.field}>
              <ThemedText style={styles.label}>Budget ($)</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="50000"
                placeholderTextColor="#999"
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
              />
            </View>

            {/* Team Members */}
            <View style={styles.field}>
              <ThemedText style={styles.label}>Team Members</ThemedText>
              <View style={styles.teamInputContainer}>
                <TextInput
                  style={[styles.input, styles.teamInput]}
                  placeholder="Add team member name"
                  placeholderTextColor="#999"
                  value={teamMember}
                  onChangeText={setTeamMember}
                  onSubmitEditing={handleAddTeamMember}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddTeamMember}>
                  <IconSymbol name="plus" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.teamList}>
                {team.map((member, index) => (
                  <View key={index} style={styles.teamMemberChip}>
                    <ThemedText style={styles.teamMemberText}>{member}</ThemedText>
                    <TouchableOpacity onPress={() => handleRemoveTeamMember(index)}>
                      <IconSymbol name="xmark" size={16} color="#999" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
              <ThemedText style={styles.createButtonText}>Create Project</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
      
      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={(date) => setDeadline(date)}
        selectedDate={deadline}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
    fontWeight: '600',
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: 'white',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsScroll: {
    flexDirection: 'row',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginRight: 8,
  },
  optionButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  optionText: {
    fontSize: 14,
    color: '#999',
  },
  optionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  teamInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  teamInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#DC2626',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  teamMemberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  teamMemberText: {
    fontSize: 14,
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
