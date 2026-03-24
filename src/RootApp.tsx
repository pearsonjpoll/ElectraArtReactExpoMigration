import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { Session } from "@supabase/supabase-js";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { isConfigured } from "./config/env";
import { supabase } from "./lib/supabase";
import { LoginScreen } from "./screens/LoginScreen";
import { RequestDetailScreen } from "./screens/RequestDetailScreen";
import { RequestsScreen } from "./screens/RequestsScreen";
import { SetupRequiredScreen } from "./screens/SetupRequiredScreen";
import { colors } from "./theme";
import { RootStackParamList } from "./types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    border: colors.border,
    card: colors.surface,
    primary: colors.accent,
    text: colors.text
  }
};

export function RootApp() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) {
      setBooting(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setBooting(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setBooting(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isConfigured) {
    return <SetupRequiredScreen />;
  }

  if (booting) {
    return (
      <View style={styles.bootContainer}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.bootText}>Loading employee app...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="dark" />
      {session ? (
        <Stack.Navigator
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            title: ""
          }}
        >
          <Stack.Screen
            component={RequestsScreen}
            name="Requests"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            component={RequestDetailScreen}
            name="RequestDetail"
            options={{ headerBackTitle: "Back", title: "Request Details" }}
          />
        </Stack.Navigator>
      ) : (
        <LoginScreen />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bootContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center"
  },
  bootText: {
    color: colors.mutedText,
    marginTop: 12
  }
});
