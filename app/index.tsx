import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  // If authenticated, go to dashboard, otherwise go to landing page
  return <Redirect href={isAuthenticated ? "/(tabs)/dashboard" : "/(auth)/landing"} />;
}
