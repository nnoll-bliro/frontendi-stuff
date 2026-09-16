import type {
  CalendarEntry,
  Meeting,
  MeetingSummary,
  Session,
  User,
} from "@server/types";

/**
 * Thin fetch wrapper over the mock API that `vite.config.ts` mounts on the dev
 * server. Same origin, so no base URL and no CORS — `/api/*` is answered by
 * server/api.ts reading SQLite.
 */
async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Response(body?.error ?? response.statusText, { status: response.status });
  }
  return (await response.json()) as T;
}

function query(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const serialised = search.toString();
  return serialised ? `?${serialised}` : "";
}

export type CalendarRange = "upcoming" | "past" | "all";

export type MeetingFilters = Partial<Record<"q" | "status" | "ownerId", string>>;

export const api = {
  session: (signal?: AbortSignal) => get<Session>("/api/session", { signal }),
  users: (signal?: AbortSignal) => get<User[]>("/api/users", { signal }),
  meetings: (filters: MeetingFilters = {}, signal?: AbortSignal) =>
    get<MeetingSummary[]>(`/api/meetings${query(filters)}`, { signal }),
  meeting: (id: string, signal?: AbortSignal) => get<Meeting>(`/api/meetings/${id}`, { signal }),
  calendar: (range: CalendarRange = "all", signal?: AbortSignal) =>
    get<CalendarEntry[]>(`/api/calendar${query({ range })}`, { signal }),
  calendarEntry: (id: string, signal?: AbortSignal) =>
    get<CalendarEntry>(`/api/calendar/${id}`, { signal }),
};

export type {
  CalendarEntry,
  CalendarParticipant,
  Meeting,
  MeetingSummary,
  MeetingStatus,
  Org,
  RsvpResponse,
  Session,
  TranscriptSegment,
  User,
} from "@server/types";
