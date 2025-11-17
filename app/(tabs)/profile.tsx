import EditProfileModal from "@/components/EditProfileModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/contexts/ThemeContext";
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
    Switch,
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

interface RecentActivity {
  id: string;
  title: string;
  time: string;
  icon: string;
  type: 'task' | 'project' | 'achievement';
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
  const { theme, toggleTheme, colors } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    totalProjects: 0,
    achievements: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [achievements] = useState<Achievement[]>([
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user && session.user.id) {
        loadUserProfile(session.user.id);
        loadUserStats(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user && session.user.id) {
        loadUserProfile(session.user.id);
        loadUserStats(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
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
          profile_picture_url: data.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadUserStats = async (userId: string) => {
    try {
      // Get all projects (owned + member of) - same as dashboard
      const { data: ownedProjects } = await supabase
        .from('projects')
        .select('id, status')
        .eq('owner_id', userId);

      const { data: memberProjects } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', userId);

      const allProjectIds = [
        ...(ownedProjects || []).map(p => p.id),
        ...(memberProjects || []).map(m => m.project_id),
      ];

      const uniqueProjectIds = [...new Set(allProjectIds)];

      // Get tasks from all projects
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, completed')
        .in('project_id', uniqueProjectIds.length > 0 ? uniqueProjectIds : ['']);

      const completedCount = (tasks || []).filter(t => t.completed).length;
      const activeCount = (tasks || []).filter(t => !t.completed).length;

      // Calculate unlocked achievements
      const unlockedAchievements = achievements.filter(a => a.unlocked).length;

      setStats({
        totalTasks: tasks?.length || 0,
        completedTasks: completedCount,
        activeTasks: activeCount,
        totalProjects: uniqueProjectIds.length,
        achievements: unlockedAchievements,
      });

      // Load recent activity
      await loadRecentActivity(userId, uniqueProjectIds);
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Set default values on error
      setStats({
        totalTasks: 0,
        completedTasks: 0,
        activeTasks: 0,
        totalProjects: 0,
        achievements: 0,
      });
    }
  };

  const loadRecentActivity = async (userId: string, projectIds: string[]) => {
    try {
      const activities: RecentActivity[] = [];

      if (projectIds.length === 0) {
        setRecentActivity([]);
        return;
      }

      // Get recently completed tasks
      const { data: completedTasks } = await supabase
        .from('tasks')
        .select('id, name, updated_at, completed')
        .in('project_id', projectIds)
        .eq('completed', true)
        .order('updated_at', { ascending: false })
        .limit(2);

      if (completedTasks) {
        completedTasks.forEach(task => {
          activities.push({
            id: task.id,
            title: `Completed "${task.name}"`,
            time: formatRelativeTime(task.updated_at),
            icon: 'checkmark.circle.fill',
            type: 'task',
          });
        });
      }

      // Get recently created projects
      const { data: recentProjects } = await supabase
        .from('projects')
        .select('id, name, created_at')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentProjects && recentProjects.length > 0) {
        const project = recentProjects[0];
        activities.push({
          id: project.id,
          title: `Created new project "${project.name}"`,
          time: formatRelativeTime(project.created_at),
          icon: 'plus.circle.fill',
          type: 'project',
        });
      }

      // Sort by most recent (you'd need to store actual timestamps for proper sorting)
      setRecentActivity(activities.slice(0, 3));
    } catch (error) {
      console.error('Error loading recent activity:', error);
      setRecentActivity([]);
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    return date.toLocaleDateString();
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await supabase.auth.signOut();
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

  const styles = createStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={() => {
          // Reload profile after save
          if (user && user.uid) {
            loadUserProfile(user.uid);
          }
        }}
      />

      <LinearGradient colors={[colors.primary, "#ff8787"]} style={styles.header}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setShowEditModal(true)}
        >
          <IconSymbol name="pencil" size={20} color={colors.card} />
        </TouchableOpacity>

        <View style={styles.profileImageContainer}>
          {profile?.profile_picture_url ? (
            <Image
              source={{ uri: profile.profile_picture_url }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <IconSymbol name="person.fill" size={50} color={colors.card} />
            </View>
          )}
        </View>
        <Text style={styles.name}>
          {profile?.full_name || user?.displayName || "User"}
        </Text>
        <Text style={styles.email}>{user?.email || ""}</Text>
        {profile?.location && (
          <View style={styles.locationBadge}>
            <IconSymbol name="location.fill" size={14} color={colors.card} />
            <Text style={styles.locationText}>{profile.location}</Text>
          </View>
        )}
        {user?.emailVerified && (
          <View style={styles.verifiedBadge}>
            <IconSymbol name="checkmark.circle.fill" size={16} color={colors.card} />
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
                color={colors.primary}
              />
              <Text style={styles.statValue}>{stats.completedTasks}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol name="clock.fill" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{stats.activeTasks}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol name="folder.fill" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{stats.totalProjects}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol name="star.fill" size={24} color={colors.primary} />
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
                    color={achievement.unlocked ? colors.primary : colors.textSecondary}
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
          {recentActivity.length > 0 ? (
            <View style={styles.activityCard}>
              {recentActivity.map((activity, index) => (
                <View key={activity.id}>
                  {index > 0 && <View style={styles.activityDivider} />}
                  <View style={styles.activityItem}>
                    <View style={styles.activityIconContainer}>
                      <IconSymbol
                        name={activity.icon as any}
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>
                        {activity.title}
                      </Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.activityCard}>
              <Text style={styles.emptyActivityText}>No recent activity</Text>
            </View>
          )}
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
                    color={colors.primary}
                  />
                  <Text style={styles.socialLinkText}>LinkedIn</Text>
                  <IconSymbol name="arrow.up.right" size={16} color={colors.textSecondary} />
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
                    color={colors.text}
                  />
                  <Text style={styles.socialLinkText}>GitHub</Text>
                  <IconSymbol name="arrow.up.right" size={16} color={colors.textSecondary} />
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
              <IconSymbol name="envelope.fill" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || "N/A"}</Text>
              </View>
            </View>

            {profile?.phone_number && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <IconSymbol name="phone.fill" size={20} color={colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{profile.phone_number}</Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <IconSymbol name="person.fill" size={20} color={colors.primary} />
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
                color={user?.emailVerified ? colors.success : colors.error}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Status</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: user?.emailVerified ? colors.success : colors.error,
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

          <View style={styles.menuItem}>
            <IconSymbol name="moon.fill" size={20} color={colors.textSecondary} />
            <Text style={styles.menuText}>Dark Mode</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          <TouchableOpacity style={styles.menuItem}>
            <IconSymbol name="bell.fill" size={20} color={colors.textSecondary} />
            <Text style={styles.menuText}>Notifications</Text>
            <IconSymbol name="chevron.right" size={20} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <IconSymbol name="lock.fill" size={20} color={colors.textSecondary} />
            <Text style={styles.menuText}>Privacy & Security</Text>
            <IconSymbol name="chevron.right" size={20} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <IconSymbol
              name="questionmark.circle.fill"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.menuText}>Help & Support</Text>
            <IconSymbol name="chevron.right" size={20} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <IconSymbol name="info.circle.fill" size={20} color={colors.textSecondary} />
            <Text style={styles.menuText}>About</Text>
            <IconSymbol name="chevron.right" size={20} color={colors.border} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <IconSymbol name="arrow.right.square.fill" size={20} color={colors.card} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
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
    color: colors.text,
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
    backgroundColor: colors.card,
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
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: colors.card,
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
    color: colors.text,
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.card,
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
    backgroundColor: colors.primary + "20", // 20% opacity
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  achievementIconLocked: {
    backgroundColor: colors.border,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: colors.textSecondary,
  },
  achievementDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 10,
    color: colors.primary,
    marginTop: 4,
  },
  activityCard: {
    backgroundColor: colors.card,
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
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activityDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  emptyActivityText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  infoCard: {
    backgroundColor: colors.card,
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
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
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
    color: colors.text,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.primary,
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
    color: colors.textSecondary,
    marginTop: 24,
    marginBottom: 40,
  },
  bioCard: {
    backgroundColor: colors.card,
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
    color: colors.textSecondary,
    lineHeight: 22,
  },
  socialLinksCard: {
    backgroundColor: colors.card,
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
    color: colors.text,
  },
});
