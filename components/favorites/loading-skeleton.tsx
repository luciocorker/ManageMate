import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

/**
 * Loading skeleton component
 * Shows placeholder cards while data is being fetched
 */
export function LoadingSkeleton() {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {[1, 2, 3].map(index => (
        <Animated.View key={index} style={[styles.card, { opacity }]}>
          <View style={styles.header}>
            <View style={styles.typeBox} />
            <View style={styles.statusBox} />
          </View>
          <View style={styles.titleBox} />
          <View style={styles.descriptionBox} />
          <View style={styles.progressBox} />
          <View style={styles.actionsRow}>
            <View style={styles.buttonBox} />
            <View style={styles.buttonBox} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    marginBottom: 12,
  },
  typeBox: {
    width: 80,
    height: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
  },
  statusBox: {
    width: 60,
    height: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
  },
  titleBox: {
    width: '70%',
    height: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    marginBottom: 8,
  },
  descriptionBox: {
    width: '100%',
    height: 40,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressBox: {
    width: '100%',
    height: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 3,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonBox: {
    flex: 1,
    height: 36,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
});
