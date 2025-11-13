import EditProfileModal from "@/components/EditProfileModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface UserStats {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  totalProjects: number;
  achievements: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

interface UserProfile {
  full_name: string;
  phone_number: string;
  location: string;
  linkedin_url: string;
  github_url: string;
  bio: string;
  profile_picture_url: string;
}

export default function ProfileScreen() {
  const [user, setUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    totalProjects: 0,
    achievements: 0,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "First Task",
      description: "Complete your first task",
      icon: "checkmark.circle.fill",
      unlocked: true,
      date: "2024-01-15",
    },
    {
      id: "2",
      title: "Task Master",
      description: "Complete 10 tasks",
      icon: "star.fill",
      unlocked: true,
      date: "2024-02-01",
    },
    {
      id: "3",
      title: "Project Creator",
      description: "Create your first project",
      icon: "folder.fill",
      unlocked: true,
      date: "2024-01-20",
    },
    {
      id: "4",
      title: "Team Player",
      description: "Collaborate on 5 projects",
      icon: "person.3.fill",
      unlocked: false,
    },
    {
      id: "5",
      title: "Streak Master",
      description: "7 day completion streak",
      icon: "flame.fill",
      unlocked: false,
    },
    {
      id: "6",
      title: "Early Bird",
      description: "Complete 5 tasks before 9 AM",
      icon: "sunrise.fill",
      unlocked: false,
    },
  ]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserProfile(currentUser.uid);
        loadUserStats(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("firebase_uid", userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone_number: data.phone_number || "",
          location: data.location || "",
          linkedin_url: data.linkedin_url || "",
          github_url: data.github_url || "",
          bio: data.bio || "",
          profile_picture_url: data.profile_picture_url || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadUserStats = async (userId: string) => {
    // Mock data - replace with actual Supabase queries
    setStats({
      totalTasks: 24,
      completedTasks: 18,
      activeTasks: 6,
      totalProjects: 5,
      achievements: 3,
    });
  };

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
            router.replace("/(auth)/landing");
          }
        },
      },
    ]);
  };

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={() => {
          // Reload profile after save
          if (user) {
            loadUserProfile(user.uid);
          }
        }}
      />

      <LinearGradient colors={["#ff6b6b", "#ff8787"]} style={styles.header}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setShowEditModal(true)}
        >
          <IconSymbol name="pencil" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.profileImageContainer}>
          {profile?.profile_picture_url ? (
            <Image
              source={{ uri: profile.profile_picture_url }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <IconSymbol name="person.fill" size={50} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.name}>
          {profile?.full_name || user?.displayName || "User"}
        </Text>
        <Text style={styles.email}>{user?.email || ""}</Text>
        {profile?.location && (
          <View style={styles.locationBadge}>
            <IconSymbol name="location.fill" size={14} color="#fff" />
            <Text style={styles.locationText}>{profile.location}</Text>
          </View>
        )}
        {user?.emailVerified && (
          <View style={styles.verifiedBadge}>
            <IconSymbol name="checkmark.circle.fill" size={16} color="#fff" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={24}
                color="#10b981"
              />
              <Text style={styles.statValue}>{stats.completedTasks}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol name="clock.fill" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{stats.activeTasks}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol name="folder.fill" size={24} color="#3b82f6" />
              <Text style={styles.statValue}>{stats.totalProjects}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol name="star.fill" size={24} color="#ff6b6b" />
              <Text style={styles.statValue}>{stats.achievements}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Task Completion Rate</Text>
              <Text style={styles.progressPercentage}>{completionRate}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[styles.progressBar, { width: `${completionRate}%` }]}
              />
            </View>
            <Text style={styles.progressSubtext}>
              {stats.completedTasks} of {stats.totalTasks} tasks completed
            </Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementLocked,
                ]}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    !achievement.unlocked && styles.achievementIconLocked,
                  ]}
                >
                  <IconSymbol
                    name={achievement.icon as any}
                    size={28}
                    color={achievement.unlocked ? "#ff6b6b" : "#9ca3af"}
                  />
                </View>
                <Text
                  style={[
                    styles.achievementTitle,
                    !achievement.unlocked && styles.achievementTitleLocked,
                  ]}
                >
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                {achievement.unlocked && achievement.date && (
                  <Text style={styles.achievementDate}>
                    Unlocked {achievement.date}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={20}
                  color="#10b981"
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  Completed "Design Review"
                </Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>

            <View style={styles.activityDivider} />

            <View style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <IconSymbol name="plus.circle.fill" size={20} color="#3b82f6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  Created new project "Mobile App"
                </Text>
                <Text style={styles.activityTime}>5 hours ago</Text>
              </View>
            </View>

            <View style={styles.activityDivider} />

            <View style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <IconSymbol name="star.fill" size={20} color="#f59e0b" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  Earned "Task Master" achievement
                </Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bio */}
        {profile?.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          </View>
        )}

        {/* Social Links */}
        {(profile?.linkedin_url || profile?.github_url) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Links</Text>
            <View style={styles.socialLinksCard}>
              {profile.linkedin_url && (
                <TouchableOpacity
                  style={styles.socialLink}
                  onPress={() => Linking.openURL(profile.linkedin_url)}
                >
                  <IconSymbol
                    name="link.circle.fill"
                    size={24}
                    color="#0077b5"
                  />
                  <Text style={styles.socialLinkText}>LinkedIn</Text>
                  <IconSymbol name="arrow.up.right" size={16} color="#6b7280" />
                </TouchableOpacity>
              )}
              {profile.github_url && (
                <TouchableOpacity
                  style={styles.socialLink}
                  onPress={() => Linking.openURL(profile.github_url)}
                >
                  <IconSymbol
                    name="chevron.left.forwardslash.chevron.right"
                    size={24}
                    color="#333"
                  />
                  <Text style={styles.socialLinkText}>GitHub</Text>
                  <IconSymbol name="arrow.up.right" size={16} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <IconSymbol name="envelope.fill" size={20} color="#ff6b6b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || "N/A"}</Text>
              </View>
            </View>

            {profile?.phone_number && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <IconSymbol name="phone.fill" size={20} color="#ff6b6b" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{profile.phone_number}</Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <IconSymbol name="person.fill" size={20} color="#ff6b6b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Display Name</Text>
                <Text style={styles.infoValue}>
                  {profile?.full_name || user?.displayName || "Not set"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <IconSymbol
                name={
                  user?.emailVerified
                    ? "checkmark.seal.fill"
                    : "xmark.seal.fill"
                }
                size={20}
                color={user?.emailVerified ? "#10b981" : "#ef4444"}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Status</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: user?.emailVerified ? "#10b981" : "#ef4444",
                    },
                  ]}
                >
                  {user?.emailVerified ? "Verified" : "Not Verified"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.menuItem}>
            <IconSymbol name="bell.fill" size={20} color="#6b7280" />
            <Text style={styles.menuText}>Notifications</Text>
            <IconSymbol name="chevron.right" size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <IconSymbol name="lock.fill" size={20} color="#6b7280" />
            <Text style={styles.menuText}>Privacy & Security</Text>
            <IconSymbol name="chevron.right" size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <IconSymbol
              name="questionmark.circle.fill"
              size={20}
              color="#6b7280"
            />
            <Text style={styles.menuText}>Help & Support</Text>
            <IconSymbol name="chevron.right" size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <IconSymbol name="info.circle.fill" size={20} color="#6b7280" />
            <Text style={styles.menuText}>About</Text>
            <IconSymbol name="chevron.right" size={20} color="#d1d5db" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <IconSymbol name="arrow.right.square.fill" size={20} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  editButton: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ff6b6b",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#ff6b6b",
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: "#6b7280",
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  achievementIconLocked: {
    backgroundColor: "#f3f4f6",
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: "#9ca3af",
  },
  achievementDescription: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 10,
    color: "#10b981",
    marginTop: 4,
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: "#6b7280",
  },
  activityDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff6b6b",
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 24,
    marginBottom: 40,
  },
  bioCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bioText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
  },
  socialLinksCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  socialLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  socialLinkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
});
