import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/lib/firebase";
import { router } from "expo-router";
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from "react-native";

export default function ProfileScreen() {
  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await auth.signOut();
            router.replace("/(auth)/landing");
          } catch (error) {
            console.warn("Sign out error:", error);
            // Even if sign out fails, redirect to landing
            router.replace("/(auth)/landing");
          }
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Profile
        </ThemedText>
        <ThemedText style={styles.description}>
          Manage your account settings and preferences.
        </ThemedText>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
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
  description: {
    marginBottom: 20,
    opacity: 0.8,
  },
  signOutButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
