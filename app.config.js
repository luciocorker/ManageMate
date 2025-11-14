import "dotenv/config";

export default {
  expo: {
    name: "ManageMate",
    slug: "ManageMate",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/managemate-logo.png",
    scheme: "managemate",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/managemate-logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    notification: {
      icon: "./assets/images/managemate-logo.png",
      color: "#DC2626",
      androidMode: "default"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.managemate.app",
      associatedDomains: ["applinks:managemate-32f1d.firebaseapp.com"],
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: "com.managemate.app",
      adaptiveIcon: {
        backgroundColor: "#FF6464",
        foregroundImage: "./assets/images/managemate-logo.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "managemate-32f1d.firebaseapp.com",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      output: "static",
      favicon: "./assets/images/managemate-logo.png",
    },
    plugins: [
      "expo-router",
      "expo-web-browser",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/managemate-logo.png",
          imageWidth: 250,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            image: "./assets/images/managemate-logo.png",
            imageWidth: 250,
            resizeMode: "contain",
            backgroundColor: "#000000",
          },
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            googleServicesFile: process.env.GOOGLE_SERVICES_JSON
              ? process.env.GOOGLE_SERVICES_JSON
              : "./google-services.json",
          },
          ios: {
            googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST
              ? process.env.GOOGLE_SERVICE_INFO_PLIST
              : "./GoogleService-Info.plist",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      eas: {
        projectId: "933a849e-a941-4a11-9a7a-f8e37408b606",
      },
    },
  },
};
