import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "../components/Card";
import { env } from "../config/env";
import { colors, spacing } from "../theme";

export function SetupRequiredScreen() {
  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Supabase setup required</Text>
        <Text style={styles.body}>
          Add your project values to `app.json` so Expo can connect to the existing backend.
        </Text>
        <Text style={styles.code}>
          {`"extra": {\n  "supabaseUrl": "YOUR_URL",\n  "supabaseAnonKey": "YOUR_ANON_KEY"\n}`}
        </Text>
        <Text style={styles.body}>
          Current values detected:
          {"\n"}
          SUPABASE_URL: {env.supabaseUrl ? env.supabaseUrl : "(missing)"}
          {"\n"}
          SUPABASE_ANON_KEY: {env.supabaseAnonKey ? "(provided)" : "(missing)"}
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  body: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.md
  },
  code: {
    backgroundColor: colors.background,
    borderRadius: 16,
    color: colors.text,
    fontFamily: "monospace",
    marginBottom: spacing.md,
    padding: spacing.md
  }
});
