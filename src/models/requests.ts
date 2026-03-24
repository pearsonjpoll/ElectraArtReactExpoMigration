export type RequestType = "tattoo" | "piercing";

export type RequestStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "accepted"
  | "closed";

export type ContactMethod = "instagram" | "email" | "phone";

export type EmployeeRequest = {
  id: string;
  requestType: RequestType;
  clientName: string;
  primaryContactMethod: ContactMethod;
  status: RequestStatus;
  proposedDates: Date[];
  createdAt: Date;
  assignedTo: string | null;
  notes: string | null;
};

export type RequestNote = {
  id: string;
  authorId: string;
  body: string;
  createdAt: Date;
};

export type RequestImage = {
  id: string;
  storageBucket: string;
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
};

export type RequestDetail = EmployeeRequest & {
  clientInstagram: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  secondaryContactMethod: ContactMethod | null;
  tattooPlacement: string | null;
  tattooColorPref: string | null;
  tattooSizeEstimate: string | null;
  tattooDescription: string | null;
  piercingPlacement: string | null;
  piercingDescription: string | null;
  requestNotes: RequestNote[];
  requestImages: RequestImage[];
};

export const requestStatusLabel: Record<RequestStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  contacted: "Contacted",
  accepted: "Accepted",
  closed: "Closed"
};

export const parseContactMethod = (value?: string | null): ContactMethod => {
  if (value === "instagram" || value === "phone") {
    return value;
  }
  return "email";
};

export const parseNullableContactMethod = (
  value?: string | null
): ContactMethod | null => {
  if (!value) {
    return null;
  }
  return parseContactMethod(value);
};

export const parseRequestType = (value?: string | null): RequestType =>
  value === "piercing" ? "piercing" : "tattoo";

export const parseRequestStatus = (value?: string | null): RequestStatus => {
  switch (value) {
    case "reviewing":
    case "contacted":
    case "accepted":
    case "closed":
      return value;
    default:
      return "new";
  }
};

export const parseDates = (value: unknown): Date[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => new Date(String(entry)))
    .filter((date) => !Number.isNaN(date.getTime()));
};

export const mapEmployeeRequest = (
  row: Record<string, unknown>
): EmployeeRequest => ({
  id: String(row.id),
  requestType: parseRequestType(asOptionalString(row.request_type)),
  clientName: asOptionalString(row.client_name) ?? "Unknown client",
  primaryContactMethod: parseContactMethod(
    asOptionalString(row.primary_contact_method)
  ),
  status: parseRequestStatus(asOptionalString(row.status)),
  proposedDates: parseDates(row.proposed_dates_json),
  createdAt: parseDate(row.created_at),
  assignedTo: asOptionalString(row.assigned_to),
  notes: asOptionalString(row.notes)
});

export const mapRequestDetail = (
  row: Record<string, unknown>,
  requestNotes: RequestNote[],
  requestImages: RequestImage[]
): RequestDetail => ({
  ...mapEmployeeRequest(row),
  clientInstagram: asOptionalString(row.client_instagram),
  clientEmail: asOptionalString(row.client_email),
  clientPhone: asOptionalString(row.client_phone),
  secondaryContactMethod: parseNullableContactMethod(
    asOptionalString(row.secondary_contact_method)
  ),
  tattooPlacement: asOptionalString(row.tattoo_placement),
  tattooColorPref: asOptionalString(row.tattoo_color_pref),
  tattooSizeEstimate: asOptionalString(row.tattoo_size_estimate),
  tattooDescription: asOptionalString(row.tattoo_description),
  piercingPlacement: asOptionalString(row.piercing_placement),
  piercingDescription: asOptionalString(row.piercing_description),
  requestNotes,
  requestImages
});

export const mapRequestNote = (row: Record<string, unknown>): RequestNote => ({
  id: String(row.id),
  authorId: asOptionalString(row.author_id) ?? "",
  body: asOptionalString(row.body) ?? "",
  createdAt: parseDate(row.created_at)
});

export const mapRequestImage = (
  row: Record<string, unknown>
): RequestImage => ({
  id: String(row.id),
  storageBucket: asOptionalString(row.storage_bucket) ?? "",
  storagePath: asOptionalString(row.storage_path) ?? "",
  mimeType: asOptionalString(row.mime_type),
  sizeBytes:
    typeof row.size_bytes === "number"
      ? row.size_bytes
      : row.size_bytes == null
        ? null
        : Number(row.size_bytes)
});

const asOptionalString = (value: unknown): string | null => {
  return typeof value === "string" ? value : null;
};

const parseDate = (value: unknown): Date => {
  const date = new Date(typeof value === "string" ? value : "");
  return Number.isNaN(date.getTime()) ? new Date() : date;
};
