import { IconSymbol } from '@/components/ui/icon-symbol';
import { FavoriteItem } from '@/types/favorites';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FavoriteCardProps {
  item: FavoriteItem;
  onRemove: (id: string) => void;
  onViewDetails: (item: FavoriteItem) => void;
}

/**
 * Individual favorite item card component
 * Displays all relevant information in a clean, minimal design
 */
export function FavoriteCard({ item, onRemove, onViewDetails }: FavoriteCardProps) {
  const handleRemove = () => {
    Alert.alert(
      'Remove Favorite',
      `Are you sure you want to remove "${item.name}" from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemove(item.id),
        },
      ]
    );
  };

  // Format date to readable string
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Get icon based on type
  const getTypeIcon = () => {
    switch (item.type) {
      case 'Project':
        return 'folder.fill';
      case 'Client':
        return 'person.fill';
      case 'Task':
        return 'checkmark.circle.fill';
      default:
        return 'star.fill';
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (item.status) {
      case 'active':
        return '#10b981';
      case 'completed':
        return '#3b82f6';
      case 'pending':
        return '#f59e0b';
      case 'on-hold':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={styles.card}>
      {/* Header with type icon and status */}
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <IconSymbol name={getTypeIcon()} size={20} color="#6b7280" />
          <Text style={styles.type}>{item.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.name}>{item.name}</Text>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      {/* Progress bar (if applicable) */}
      {item.progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${item.progress}%`, backgroundColor: '#ef4444' },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>
      )}

      {/* Metadata */}
      {item.metadata?.clientName && (
        <View style={styles.metadataRow}>
          <IconSymbol name="building.2.fill" size={14} color="#9ca3af" />
          <Text style={styles.metadataText}>{item.metadata.clientName}</Text>
        </View>
      )}

      {item.metadata?.dueDate && (
        <View style={styles.metadataRow}>
          <IconSymbol name="calendar" size={14} color="#9ca3af" />
          <Text style={styles.metadataText}>
            Due: {item.metadata.dueDate.toLocaleDateString()}
          </Text>
        </View>
      )}

      {/* Last updated */}
      <Text style={styles.lastUpdated}>Updated {formatDate(item.lastUpdated)}</Text>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.viewButton]}
          onPress={() => onViewDetails(item)}
        >
          <IconSymbol name="eye.fill" size={16} color="#3b82f6" />
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.removeButton]}
          onPress={handleRemove}
        >
          <IconSymbol name="trash.fill" size={16} color="#ef4444" />
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  type: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    minWidth: 35,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metadataText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  removeButton: {
    backgroundColor: '#2a1a1a',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});
