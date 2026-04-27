import { env } from "../config/env";
import { supabase } from "../lib/supabase";
import {
  EmployeeRequest,
  RequestDetail,
  RequestStatus,
  mapEmployeeRequest,
  mapRequestDetail
} from "../models/requests";

const assertClient = () => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase;
};

export class RequestsRepository {
  async getCurrentUser() {
    const client = assertClient();
    return client.auth.getUser();
  }

  async fetchRequests(status?: RequestStatus | null): Promise<EmployeeRequest[]> {
    const client = assertClient();
    const {
      data: { user }
    } = await client.auth.getUser();

    if (!user?.id) {
      throw new Error("No signed-in user.");
    }

    let query = client.from("requests").select(
      "id, request_type, client_name, primary_contact_method, status, proposed_dates_json, created_at, assigned_to, preferred_staff_id, notes"
    );

    // Show the shared intake queue plus anything already assigned to the
    // signed-in employee.
    query = query.or(`assigned_to.is.null,assigned_to.eq.${user.id}`);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapEmployeeRequest(row));
  }

  async fetchRequestDetail(requestId: string): Promise<RequestDetail> {
    const client = assertClient();

    const requestResult = await client
      .from("requests")
      .select(
        "id, request_type, client_name, client_instagram, client_email, client_phone, primary_contact_method, secondary_contact_method, notes, tattoo_placement, tattoo_color_pref, tattoo_size_estimate, tattoo_description, piercing_placement, piercing_description, proposed_dates_json, status, assigned_to, preferred_staff_id, created_at"
      )
      .eq("id", requestId)
      .single();

    if (requestResult.error) {
      throw requestResult.error;
    }

    return mapRequestDetail(requestResult.data);
  }

  async assignToCurrentUser(requestId: string): Promise<void> {
    const client = assertClient();
    const {
      data: { user }
    } = await client.auth.getUser();

    if (!user?.id) {
      throw new Error("No signed-in user.");
    }

    await this.invokeUpdateRequest({
      request_id: requestId,
      assigned_to: user.id
    });
  }

  async updateStatus(requestId: string, status: RequestStatus): Promise<void> {
    await this.invokeUpdateRequest({
      request_id: requestId,
      status
    });
  }

  private async invokeUpdateRequest(
    body: Record<string, unknown>
  ): Promise<void> {
    const client = assertClient();
    const {
      data: { session }
    } = await client.auth.getSession();

    if (!session?.access_token) {
      throw new Error("No active session.");
    }

    const response = await fetch(`${env.supabaseUrl}/functions/v1/update-request`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: env.supabaseAnonKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(extractErrorMessage(text));
    }
  }
}

const extractErrorMessage = (responseText: string): string => {
  if (!responseText) {
    return "Request update failed.";
  }

  try {
    const decoded = JSON.parse(responseText) as {
      error?: string;
      message?: string;
    };
    return decoded.error ?? decoded.message ?? "Request update failed.";
  } catch {
    return responseText;
  }
};
