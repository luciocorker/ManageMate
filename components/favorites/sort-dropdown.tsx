import { IconSymbol } from '@/components/ui/icon-symbol';
import { SortConfig, SortField } from '@/types/favorites';
import React, { useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SortDropdownProps {
  sortConfig: SortConfig;
  onSortChange: (field: SortField) => void;
}

interface SortOption {
  field: SortField;
  label: string;
  icon: string;
  ascLabel: string;
  descLabel: string;
}

/**
 * Sort dropdown component for favorites
 * Allows users to sort by Name, Date, or Progress
 * Shows current sort field and order with visual indicators
 */
export function SortDropdown({ sortConfig, onSortChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Define available sort options
  const sortOptions: SortOption[] = [
    {
      field: 'name',
      label: 'Name',
      icon: 'textformat',
      ascLabel: 'A → Z',
      descLabel: 'Z → A',
    },
    {
      field: 'date',
      label: 'Date',
      icon: 'calendar.circle.fill',
      ascLabel: 'Oldest First',
      descLabel: 'Newest First',
    },
    {
      field: 'progress',
      label: 'Progress',
      icon: 'chart.bar.fill',
      ascLabel: 'Low → High',
      descLabel: 'High → Low',
    },
  ];

  // Get current sort option details
  const currentOption = sortOptions.find(opt => opt.field === sortConfig.field);
  const currentLabel = currentOption
    ? sortConfig.order === 'asc'
      ? currentOption.ascLabel
      : currentOption.descLabel
    : 'Sort';

  /**
   * Handle sort option selection
   * Toggles order if same field, otherwise sets new field
   */
  const handleSelect = (field: SortField) => {
    onSortChange(field);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Sort button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsOpen(true)}
        accessibilityLabel="Sort favorites"
        accessibilityHint="Opens sort options menu"
      >
        <IconSymbol name="arrow.up.arrow.down" size={16} color="#9ca3af" />
        <Text style={styles.buttonText}>{currentLabel}</Text>
        <IconSymbol
          name={isOpen ? 'chevron.up' : 'chevron.down'}
          size={14}
          color="#9ca3af"
        />
      </TouchableOpacity>

      {/* Dropdown modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View style={styles.dropdown}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <IconSymbol name="xmark" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {sortOptions.map(option => {
              const isActive = sortConfig.field === option.field;
              const orderLabel =
                sortConfig.order === 'asc' ? option.ascLabel : option.descLabel;

              return (
                <TouchableOpacity
                  key={option.field}
                  style={[styles.option, isActive && styles.optionActive]}
                  onPress={() => handleSelect(option.field)}
                  accessibilityLabel={`Sort by ${option.label}`}
                  accessibilityState={{ selected: isActive }}
                >
                  <View style={styles.optionLeft}>
                    <IconSymbol
                      name={option.icon as any}
                      size={20}
                      color={isActive ? '#ef4444' : '#9ca3af'}
                    />
                    <View>
                      <Text
                        style={[styles.optionLabel, isActive && styles.optionLabelActive]}
                      >
                        {option.label}
                      </Text>
                      {isActive && (
                        <Text style={styles.optionSubLabel}>{orderLabel}</Text>
                      )}
                    </View>
                  </View>

                  {isActive && (
                    <View style={styles.activeIndicator}>
                      <IconSymbol
                        name={
                          sortConfig.order === 'asc'
                            ? 'arrow.up.circle.fill'
                            : 'arrow.down.circle.fill'
                        }
                        size={16}
                        color="#ef4444"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            <View style={styles.dropdownFooter}>
              <Text style={styles.footerText}>
                Tap again to reverse order
              </Text>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdown: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    width: '100%',
    maxWidth: 320,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  optionActive: {
    backgroundColor: '#2a1a1a',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  optionLabelActive: {
    color: '#ef4444',
  },
  optionSubLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  activeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownFooter: {
    padding: 12,
    backgroundColor: '#0a0a0a',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
