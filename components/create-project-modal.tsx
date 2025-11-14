import { DatePickerModal } from '@/components/date-picker-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { searchUsers } from '@/lib/supabaseService';
import { ProjectPriority, ProjectStatus } from '@/types/project';
import { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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
  team: { id: string; name: string; email: string; avatar_url: string | null }[];
}

export function CreateProjectModal({ visible, onClose, onCreateProject }: CreateProjectModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Planning');
  const [priority, setPriority] = useState<ProjectPriority>('Medium');
  const [deadline, setDeadline] = useState('');
  const [budget, setBudget] = useState('');
  const [teamMemberSearch, setTeamMemberSearch] = useState('');
  const [team, setTeam] = useState<{ id: string; name: string; email: string; avatar_url: string | null }[]>([]);
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; email: string; avatar_url: string | null }[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const statuses: ProjectStatus[] = ['Planning', 'In Progress', 'Review', 'Testing', 'Completed', 'Paused', 'Archived'];
  const priorities: ProjectPriority[] = ['Low', 'Medium', 'High', 'Critical'];

  const handleSearchUsers = async (query: string) => {
    setTeamMemberSearch(query);
    if (query.trim().length >= 2) {
      const results = await searchUsers(query);
      // Filter out already added team members
      const filtered = results.filter(user => !team.some(member => member.id === user.id));
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddTeamMember = (user: { id: string; name: string; email: string; avatar_url: string | null }) => {
    if (!team.some(member => member.id === user.id)) {
      setTeam([...team, user]);
      setTeamMemberSearch('');
      setSearchResults([]);
    }
  };

  const handleRemoveTeamMember = (userId: string) => {
    setTeam(team.filter(member => member.id !== userId));
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
    setTeamMemberSearch('');
    setSearchResults([]);
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modal} lightColor={colors.card} darkColor={colors.card}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>Create New Project</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Project Name */}
            <View style={styles.field}>
              <ThemedText style={styles.label}>Project Name *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter project name"
                placeholderTextColor={colors.textSecondary}
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
                placeholderTextColor={colors.textSecondary}
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
                <IconSymbol name="calendar" size={20} color={colors.textSecondary} />
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
                    <IconSymbol name="xmark" size={16} color={colors.textSecondary} />
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
                placeholderTextColor={colors.textSecondary}
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
                  placeholder="Search users by name..."
                  placeholderTextColor={colors.textSecondary}
                  value={teamMemberSearch}
                  onChangeText={handleSearchUsers}
                />
              </View>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <View style={styles.searchResults}>
                  {searchResults.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      style={styles.searchResultItem}
                      onPress={() => handleAddTeamMember(user)}
                    >
                      {user.avatar_url ? (
                        <Image
                          source={{ uri: user.avatar_url }}
                          style={styles.searchResultAvatar}
                        />
                      ) : (
                        <View style={styles.searchResultAvatarPlaceholder}>
                          <IconSymbol name="person.fill" size={20} color={colors.primary} />
                        </View>
                      )}
                      <View style={styles.searchResultInfo}>
                        <ThemedText style={styles.searchResultName}>{user.name}</ThemedText>
                        <ThemedText style={styles.searchResultEmail}>{user.email}</ThemedText>
                      </View>
                      <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {/* Selected Team Members */}
              {team.length > 0 && (
                <View style={styles.teamList}>
                  {team.map((member) => (
                    <View key={member.id} style={styles.teamMemberChip}>
                      {member.avatar_url ? (
                        <Image
                          source={{ uri: member.avatar_url }}
                          style={styles.teamMemberAvatar}
                        />
                      ) : (
                        <View style={styles.teamMemberAvatarPlaceholder}>
                          <IconSymbol name="person.fill" size={16} color={colors.primary} />
                        </View>
                      )}
                      <View style={styles.teamMemberInfo}>
                        <ThemedText style={styles.teamMemberText}>{member.name}</ThemedText>
                        <ThemedText style={styles.teamMemberEmail}>{member.email}</ThemedText>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveTeamMember(member.id)}>
                        <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
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

const createStyles = (colors: any) => StyleSheet.create({
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
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
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
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  datePickerButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  datePickerText: {
    fontSize: 16,
    color: colors.textSecondary,
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
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.card,
    fontWeight: '600',
  },
  teamInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  teamInput: {
    flex: 1,
  },
  searchResults: {
    marginTop: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
  searchResultAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  searchResultEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamList: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 12,
  },
  teamMemberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  teamMemberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  teamMemberAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  teamMemberEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
});
