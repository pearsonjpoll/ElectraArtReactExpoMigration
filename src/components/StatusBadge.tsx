import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { RequestStatus, requestStatusLabel } from "../models/requests";
import { colors } from "../theme";

const palette: Record<RequestStatus, { backgroundColor: string; color: string }> =
  {
    new: { backgroundColor: colors.badgeNewBg, color: colors.badgeNewText },
    reviewing: {
      backgroundColor: colors.badgeReviewingBg,
      color: colors.badgeReviewingText
    },
    contacted: {
      backgroundColor: colors.badgeContactedBg,
      color: colors.badgeContactedText
    },
    accepted: {
      backgroundColor: colors.badgeAcceptedBg,
      color: colors.badgeAcceptedText
    },
    closed: { backgroundColor: colors.badgeClosedBg, color: colors.badgeClosedText }
  };

export function StatusBadge({ status }: { status: RequestStatus }) {
  const statusPalette = palette[status];

  return (
    <View style={[styles.badge, statusPalette]}>
      <Text style={[styles.label, { color: statusPalette.color }]}>
        {requestStatusLabel[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  label: {
    fontSize: 12,
    fontWeight: "700"
  }
});
