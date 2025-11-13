import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';

interface ExpandableSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  iconColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function ExpandableSearch({
  onSearch,
  placeholder = 'Search...',
  iconColor = '#666',
  backgroundColor = '#f5f5f5',
  textColor = '#333',
}: ExpandableSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const animatedWidth = useRef(new Animated.Value(40)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  const screenWidth = Dimensions.get('window').width;
  const maxWidth = screenWidth - 32; // Account for padding

  useEffect(() => {
    if (isExpanded) {
      Animated.parallel([
        Animated.timing(animatedWidth, {
          toValue: maxWidth,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        inputRef.current?.focus();
      });
    } else {
      Animated.parallel([
        Animated.timing(animatedWidth, {
          toValue: 40,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isExpanded, maxWidth]);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setSearchQuery('');
    onSearch('');
  };

  const handleChangeText = (text: string) => {
    setSearchQuery(text);
    onSearch(text);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: animatedWidth,
          backgroundColor,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handleExpand}
        style={styles.iconButton}
        activeOpacity={0.7}
      >
        <Ionicons name="search" size={20} color={iconColor} />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.inputContainer,
          {
            opacity: animatedOpacity,
          },
        ]}
        pointerEvents={isExpanded ? 'auto' : 'none'}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: textColor }]}
          value={searchQuery}
          onChangeText={handleChangeText}
          onBlur={handleCollapse}
          placeholder={placeholder}
          placeholderTextColor="#999"
          returnKeyType="search"
        />
      </Animated.View>

      {isExpanded && searchQuery.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            setSearchQuery('');
            onSearch('');
          }}
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={18} color={iconColor} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  iconButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
