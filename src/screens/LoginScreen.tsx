import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { supabase } from "../lib/supabase";
import { colors, spacing } from "../theme";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const signIn = async () => {
    if (!email.trim()) {
      setErrorText("Enter your email.");
      return;
    }

    if (!password) {
      setErrorText("Enter your password.");
      return;
    }

    if (!supabase) {
      setErrorText("Supabase is not configured.");
      return;
    }

    setSubmitting(true);
    setErrorText(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    setSubmitting(false);

    if (error) {
      setErrorText(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.container}
    >
      <View style={styles.centerWrap}>
        <Card>
          <Text style={styles.title}>Employee sign in</Text>
          <Text style={styles.subtitle}>
            Use your staff Supabase account to manage incoming requests.
          </Text>

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.mutedText}
            style={styles.input}
            value={email}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setPassword}
            onSubmitEditing={signIn}
            placeholder="Password"
            placeholderTextColor={colors.mutedText}
            secureTextEntry
            style={styles.input}
            value={password}
          />

          {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

          <PrimaryButton label="Sign in" loading={submitting} onPress={signIn} />
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.lg
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  error: {
    color: colors.error,
    marginBottom: spacing.md
  }
});
