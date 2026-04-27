import type { ExpoConfig } from "expo/config";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

const config: ExpoConfig = {
  name: "Employee App",
  slug: "employee-app-expo",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  icon: "./assets/icon.png",
  assetBundlePatterns: ["**/*"],
  android: {
    package: "com.electra.employeeapp",
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#000000"
    }
  },
  ios: {
    bundleIdentifier: "com.electra.employeeapp"
  },
  extra: {
    supabaseUrl,
    supabaseAnonKey,
    eas: {
      projectId: "3dfe495b-45f7-4d9a-84d2-58c1e0d318ca"
    }
  }
};

export default config;
