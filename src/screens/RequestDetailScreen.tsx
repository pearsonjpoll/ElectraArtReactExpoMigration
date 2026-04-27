import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { StatusBadge } from "../components/StatusBadge";
import { RequestDetail } from "../models/requests";
import { RequestsRepository } from "../services/requestsRepository";
import { colors, spacing } from "../theme";
import { RootStackParamList } from "../types/navigation";
import { formatDateTime } from "../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "RequestDetail">;

const repository = new RequestsRepository();

export function RequestDetailScreen({ route }: Props) {
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadRequest = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const result = await repository.fetchRequestDetail(route.params.requestId);
        const {
          data: { user }
        } = await repository.getCurrentUser();
        setCurrentUserId(user?.id ?? null);
        setRequest(result);
        setErrorText(null);
      } catch (error) {
        setErrorText(
          error instanceof Error ? error.message : "Could not load this request."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [route.params.requestId]
  );

  useEffect(() => {
    void loadRequest();
  }, [loadRequest]);

  const runAction = async (
    action: () => Promise<void>,
    successMessage: string
  ) => {
    try {
      setSaving(true);
      await action();
      Alert.alert("Success", successMessage);
      await loadRequest(true);
    } catch (error) {
      Alert.alert(
        "Update failed",
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (errorText || !request) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>{errorText ?? "Could not load this request."}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void loadRequest(true)}
        />
      }
      style={styles.container}
    >
      <Card>
        <View style={styles.topRow}>
          <Text style={styles.title}>{request.clientName}</Text>
          <StatusBadge status={request.status} />
        </View>
        <Text style={styles.detailText}>Type: {capitalize(request.requestType)}</Text>
        <Text style={styles.detailText}>Created: {formatDateTime(request.createdAt)}</Text>
        <Text style={styles.detailText}>
          Primary contact: {capitalize(request.primaryContactMethod)}
        </Text>
        <Text style={styles.detailText}>
          Assigned: {request.assignedTo ? request.assignedTo : "No one yet"}
        </Text>
        <Text style={styles.detailText}>
          Preferred staff:{" "}
          {request.preferredStaffId
            ? request.preferredStaffId === currentUserId
              ? "You"
              : "Set"
            : "No preference"}
        </Text>
        {request.notes?.trim() ? <Text style={styles.notesText}>{request.notes}</Text> : null}
      </Card>

      <Section title="Contact Details">
        <DetailLine label="Instagram" value={request.clientInstagram} />
        <DetailLine label="Email" value={request.clientEmail} />
        <DetailLine label="Phone" value={request.clientPhone} />
        <DetailLine
          label="Secondary contact"
          value={
            request.secondaryContactMethod
              ? capitalize(request.secondaryContactMethod)
              : null
          }
        />
      </Section>

      <Section title="Proposed Dates">
        {request.proposedDates.length === 0 ? (
          <Text style={styles.detailText}>No proposed dates listed.</Text>
        ) : (
          request.proposedDates.map((date, index) => (
            <Text key={`${date.toISOString()}-${index}`} style={styles.detailText}>
              {formatDateTime(date)}
            </Text>
          ))
        )}
      </Section>

      <Section title={request.requestType === "tattoo" ? "Tattoo Details" : "Piercing Details"}>
        {request.requestType === "tattoo" ? (
          <>
            <DetailLine label="Placement" value={request.tattooPlacement} />
            <DetailLine label="Color preference" value={request.tattooColorPref} />
            <DetailLine label="Size estimate" value={request.tattooSizeEstimate} />
            <DetailLine label="Description" value={request.tattooDescription} />
          </>
        ) : (
          <>
            <DetailLine label="Placement" value={request.piercingPlacement} />
            <DetailLine label="Description" value={request.piercingDescription} />
          </>
        )}
      </Section>

      <View style={styles.actions}>
        <PrimaryButton
          disabled={saving}
          label="Assign to me"
          onPress={() =>
            void runAction(
              () => repository.assignToCurrentUser(request.id),
              "Request assigned to you."
            )
          }
          variant="outlined"
        />
        <PrimaryButton
          disabled={saving}
          label="Mark reviewing"
          onPress={() =>
            void runAction(
              () => repository.updateStatus(request.id, "reviewing"),
              "Request marked as reviewing."
            )
          }
          variant="outlined"
        />
        <PrimaryButton
          disabled={saving}
          label="Mark contacted"
          onPress={() =>
            void runAction(
              () => repository.updateStatus(request.id, "contacted"),
              "Request marked as contacted."
            )
          }
          variant="outlined"
        />
        <PrimaryButton
          disabled={saving}
          label="Approve request"
          onPress={() =>
            void runAction(
              () => repository.updateStatus(request.id, "accepted"),
              "Request approved."
            )
          }
        />
        <PrimaryButton
          disabled={saving}
          label="Cancel request"
          onPress={() =>
            void runAction(
              () => repository.updateStatus(request.id, "closed"),
              "Request closed."
            )
          }
          variant="text"
        />
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </Card>
  );
}

function DetailLine({ label, value }: { label: string; value: string | null }) {
  return (
    <Text style={styles.detailText}>
      {label}: {value?.trim() ? value : "Not provided"}
    </Text>
  );
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xxl
  },
  centerState: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  errorText: {
    color: colors.error,
    fontSize: 15,
    textAlign: "center"
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: 26,
    fontWeight: "700",
    paddingRight: spacing.sm
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  detailText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: spacing.xs
  },
  notesText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.sm
  },
  actions: {
    gap: spacing.sm
  }
});
