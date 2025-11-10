import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Project } from '@/types/project';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ProjectActionsMenuProps {
  visible: boolean;
  onClose: () => void;
  project: Project;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
  onTogglePause: () => void;
  onMarkComplete: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

interface ActionItem {
  icon: any;
  label: string;
  onPress: () => void;
  color?: string;
  show?: boolean;
}

export function ProjectActionsMenu({
  visible,
  onClose,
  project,
  onEdit,
  onDuplicate,
  onToggleFavorite,
  onTogglePause,
  onMarkComplete,
  onArchive,
  onDelete,
}: ProjectActionsMenuProps) {
  const iconColor = '#999';

  const actions: ActionItem[] = [
    {
      icon: 'pencil',
      label: 'Edit Project',
      onPress: () => {
        onEdit();
        onClose();
      },
    },
    {
      icon: 'doc.on.doc',
      label: 'Duplicate Project',
      onPress: () => {
        onDuplicate();
        onClose();
      },
    },
    {
      icon: project.isFavorite ? 'star.fill' : 'star',
      label: project.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
      onPress: () => {
        onToggleFavorite();
        onClose();
      },
      color: project.isFavorite ? '#f59e0b' : undefined,
    },
    {
      icon: project.status === 'Paused' ? 'play' : 'pause',
      label: project.status === 'Paused' ? 'Resume Project' : 'Pause Project',
      onPress: () => {
        onTogglePause();
        onClose();
      },
      show: project.status === 'In Progress' || project.status === 'Paused',
    },
    {
      icon: 'checkmark',
      label: 'Mark as Complete',
      onPress: () => {
        onMarkComplete();
        onClose();
      },
      color: '#10b981',
      show: project.status !== 'Completed' && project.status !== 'Archived',
    },
    {
      icon: 'archivebox',
      label: 'Archive Project',
      onPress: () => {
        onArchive();
        onClose();
      },
      show: project.status !== 'Archived',
    },
    {
      icon: 'trash',
      label: 'Delete Project',
      onPress: () => {
        onDelete();
        onClose();
      },
      color: '#ef4444',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <ThemedView 
          style={styles.menu}
          lightColor="#1e1e1e"
          darkColor="#1e1e1e"
        >
          <View style={styles.header}>
            <ThemedText style={styles.title}>{project.name}</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          {actions.map((action, index) => {
            if (action.show === false) return null;
            
            return (
              <TouchableOpacity
                key={index}
                style={styles.action}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <IconSymbol 
                  name={action.icon} 
                  size={20} 
                  color={action.color || iconColor} 
                />
                <ThemedText 
                  style={[
                    styles.actionText,
                    action.color && { color: action.color }
                  ]}
                >
                  {action.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menu: {
    borderRadius: 12,
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    opacity: 0.3,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  actionText: {
    fontSize: 15,
  },
});
