import type { TranscriptionLanguageCode } from "@bliro/common-types/languages";

/**
 * The account preferences the settings page edits. Deliberately **not** in
 * SQLite: none of it is read anywhere else, and a prototype that wants a
 * different starting state should be able to change it by editing one object.
 */
export interface AccountSettings {
  firstName: string;
  lastName: string;
  primaryLanguage: TranscriptionLanguageCode;
  secondaryLanguage: TranscriptionLanguageCode;
  timezone: string;
}

export const DEFAULT_ACCOUNT_SETTINGS: Omit<AccountSettings, "firstName" | "lastName"> = {
  primaryLanguage: "de",
  secondaryLanguage: "en",
  timezone: "Europe/Berlin",
};

/** The languages worth putting at the top of the picker for this account. */
export const PINNED_LANGUAGES: TranscriptionLanguageCode[] = ["de", "en", "fr", "es"];

/** Short, plausible list — the real app resolves the full IANA set. */
export const TIMEZONES = [
  "Europe/Berlin",
  "Europe/London",
  "Europe/Lisbon",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Warsaw",
  "Europe/Helsinki",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Singapore",
  "Australia/Sydney",
] as const;

/** Phone assistant state — fake, and only read by the settings page. */
export const PHONE_ASSISTANT = {
  enabled: true,
  number: "+49 30 568 39241",
  forwardingConfigured: true,
};

/** VoiceID enrolment state — fake, same caveat. */
export const VOICE_ID = {
  enrolled: true,
  enrolledAt: "2026-08-12T09:20:00.000Z",
  sampleSeconds: 42,
};
