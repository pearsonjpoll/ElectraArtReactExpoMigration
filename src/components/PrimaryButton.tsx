import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "filled" | "outlined" | "text";
};

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "filled"
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === "filled" && styles.filled,
        variant === "outlined" && styles.outlined,
        variant === "text" && styles.textOnly,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "filled" ? "#FFFFFF" : colors.accent} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === "filled" ? styles.filledLabel : styles.outlinedLabel
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  filled: {
    backgroundColor: colors.accent
  },
  outlined: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
    borderWidth: 1
  },
  textOnly: {
    backgroundColor: "transparent"
  },
  pressed: {
    opacity: 0.85
  },
  disabled: {
    opacity: 0.5
  },
  label: {
    fontSize: 15,
    fontWeight: "700"
  },
  filledLabel: {
    color: "#FFFFFF"
  },
  outlinedLabel: {
    color: colors.accent
  }
});
