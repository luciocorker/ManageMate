import { supabase } from "@/lib/supabase";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session);
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff" }}>
        <Image
          source={require("@/assets/images/managemate-logo.png")}
          style={{ width: 200, height: 200, marginBottom: 30 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  console.log("Redirecting to:", isAuthenticated ? "dashboard" : "landing");
  
  return isAuthenticated ? (
    <Redirect href="/(tabs)/dashboard" />
  ) : (
    <Redirect href="/(auth)/landing" />
  );
}
