import type { ExpoConfig } from "expo/config";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

const config: ExpoConfig = {
  name: "Employee App",
  slug: "employee-app-expo",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  assetBundlePatterns: ["**/*"],
  android: {
    package: "com.electra.employeeapp"
  },
  ios: {
    bundleIdentifier: "com.electra.employeeapp"
  },
  extra: {
    supabaseUrl,
    supabaseAnonKey
  }
};

export default config;
