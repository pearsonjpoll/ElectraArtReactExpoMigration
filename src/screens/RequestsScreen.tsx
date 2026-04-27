import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { StatusBadge } from "../components/StatusBadge";
import { supabase } from "../lib/supabase";
import {
  EmployeeRequest,
  RequestStatus,
  requestStatusLabel
} from "../models/requests";
import { RequestsRepository } from "../services/requestsRepository";
import { colors, spacing } from "../theme";
import { RootStackParamList } from "../types/navigation";
import { formatDateTime } from "../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "Requests">;

const repository = new RequestsRepository();
const filterOptions: Array<{ label: string; value: RequestStatus | null }> = [
  { label: "My queue + unassigned", value: null },
  { label: requestStatusLabel.new, value: "new" },
  { label: requestStatusLabel.reviewing, value: "reviewing" },
  { label: requestStatusLabel.contacted, value: "contacted" },
  { label: requestStatusLabel.accepted, value: "accepted" },
  { label: requestStatusLabel.closed, value: "closed" }
];

export function RequestsScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isCompact = width < 420;
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadRequests = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const {
          data: { user }
        } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
        const result = await repository.fetchRequests(statusFilter);
        setCurrentUserId(user?.id ?? null);
        setRequests(result);
        setErrorText(null);
      } catch (error) {
        setErrorText(
          error instanceof Error ? error.message : "Could not load requests."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      void loadRequests(true);
    });
    return unsubscribe;
  }, [loadRequests, navigation]);

  const signOut = async () => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Sign out failed", error.message);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={[styles.header, isCompact && styles.headerCompact]}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Employee Requests</Text>
          <Text style={styles.subtitle}>
            Review intake records and update request state.
          </Text>
        </View>
        <View style={[styles.signOutWrap, isCompact && styles.signOutWrapCompact]}>
          <PrimaryButton label="Sign out" onPress={signOut} variant="outlined" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadRequests(true)}
          />
        }
      >
        <Card>
          <Text style={styles.sectionTitle}>Status filter</Text>
          <View style={styles.filterWrap}>
            {filterOptions.map((option) => {
              const selected = option.value === statusFilter;
              return (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => setStatusFilter(option.value)}
                  style={[styles.filterChip, selected && styles.filterChipSelected]}
                >
                  <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : errorText ? (
          <View style={styles.centerState}>
            <Text style={styles.errorText}>{errorText}</Text>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.emptyText}>
              No requests in your queue match this filter right now.
            </Text>
          </View>
        ) : (
          requests.map((request) => {
            const firstDate = request.proposedDates[0]
              ? formatDateTime(request.proposedDates[0])
              : "No proposed date";

            return (
              <TouchableOpacity
                key={request.id}
                onPress={() =>
                  navigation.navigate("RequestDetail", { requestId: request.id })
                }
              >
                <Card>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestTitle}>{request.clientName}</Text>
                    <StatusBadge status={request.status} />
                  </View>
                  <Text style={styles.requestMeta}>
                    {capitalize(request.requestType)} request -{" "}
                    {capitalize(request.primaryContactMethod)}
                  </Text>
                  <Text style={styles.requestMeta}>
                    First proposed date: {firstDate}
                  </Text>
                  {request.notes?.trim() ? (
                    <Text numberOfLines={2} style={styles.requestNotes}>
                      {request.notes}
                    </Text>
                  ) : null}
                  <View style={styles.metaFooter}>
                    <Text style={styles.assignmentLabel}>
                      {request.assignedTo ? "Assigned" : "Unassigned"}
                    </Text>
                    {request.preferredStaffId ? (
                      <Text style={styles.preferredLabel}>
                        Preferred staff:{" "}
                        {request.preferredStaffId === currentUserId ? "You" : "Set"}
                      </Text>
                    ) : null}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm
  },
  headerCompact: {
    flexDirection: "column",
    gap: spacing.md
  },
  headerCopy: {
    flex: 1,
    paddingRight: spacing.sm
  },
  signOutWrap: {
    minWidth: 132
  },
  signOutWrapCompact: {
    alignSelf: "stretch",
    minWidth: 0
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700"
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xxl
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  filterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  filterChip: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  filterChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  filterText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600"
  },
  filterTextSelected: {
    color: "#FFFFFF"
  },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 220
  },
  errorText: {
    color: colors.error,
    fontSize: 15,
    textAlign: "center"
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 15,
    textAlign: "center"
  },
  requestHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  requestTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    paddingRight: spacing.sm
  },
  requestMeta: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.xs
  },
  requestNotes: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs
  },
  assignmentLabel: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.sm
  },
  metaFooter: {
    gap: 4,
    marginTop: spacing.sm
  },
  preferredLabel: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700"
  }
});
