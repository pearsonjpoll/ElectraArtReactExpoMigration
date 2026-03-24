import React, { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { colors, spacing } from "../theme";

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    padding: spacing.md
  }
});
