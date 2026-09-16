// Keeping at least one entry avoids `never` typing issues in consumers.
export enum FeatureFlagKey {
  WebPhoneAgent = "web_phone_agent",
  OauthMicrosoftOutlook_2026_04_22 = "oauth_microsoft_outlook_2026_04_22",
  OauthGoogleCalendar_2026_04_22 = "oauth_google_calendar_2026_04_22",
  OauthGoogleMail_2026_05_21 = "oauth_google_mail_2026_05_21",
  VoiceID = "web_voice_id",
  // Gates new Salesforce connections onto the External Client App (ECA) credentials
  // instead of the legacy Connected App. Once a user connects under the ECA the
  // integration record stores this flag in `scopeVersion`, so the refresh path
  // keeps using the matching credentials even if the flag is later flipped off.
  OauthSalesforceEca_2026_05_21 = "oauth_salesforce_eca_2026_05_21",
  // Usage & limits surface, shipped as ONE flag with progressive variants instead of a
  // flag per view. Each variant KEY is a rollout stage (see USAGE_LIMITS_STAGES); a user
  // is assigned exactly one. Read it with `useUsageAccess`, not `isEnabled`.
  WebUsageLimits = "web_usage_limits",
  // Gates the Intercom Messenger JWT identity-verification boot. When on, the
  // web app fetches a signed JWT and boots Intercom with a verified `user_id` (= email);
  // when off it boots email-only. MUST stay off for a user until
  // their Intercom contact has been backfilled with `external_id = email`, otherwise the
  // verified boot forks a duplicate contact.
  IntercomJwtIdentity = "intercom_jwt_identity",
  // Member suspension, shipped as ONE flag with progressive variants. Each variant KEY is a
  // rollout stage; SUSPEND_MEMBER_STAGES is the list, and assigning a key that is not in it is
  // the same as `off`. `members_manage` gives admins suspend/activate on the members page.
  // It governs those admin affordances and nothing else — the lockout screen reads the server's
  // refusal (see AccountSuspendedGate), and member deletion is permission-gated. Read it with
  // `useSuspendMemberAccess`, not `isEnabled`.
  WebSuspendMember = "web_suspend_member",
  // Gates the unattended daily scheduled Intercom contact reconciliation job.
  // Read on each nightly cron tick so the job can be activated, dry-run, or paused in production
  // without redeploying the backend container (follows the three-state rollout pattern:
  // "off" -> "dry-run" [evaluate-and-log] -> "live" [enforce]).
  ReconcileIntercomContacts = "reconcile_intercom_contacts",
  // The License Access Gate's rollout, shipped as ONE flag with progressive variants
  // shared across every backend surface it gates (Twilio, Web, Desktop — ADR-0001 D13)
  // and, since WA-936, the Web App's own client-side gating as well.
  // Each variant KEY is a rollout stage: "off" -> "evaluate-and-log" -> "enforce". Read it
  // with `getLicenseAccessGateStage`, not `isEnabled` — a per-user flag, unlike
  // `ReconcileIntercomContacts`'s userless system flag.
  LicenseAccessGate = "license_access_gate",
}

/**
 * Fallback variants used when Amplitude fetch fails.
 */
export const FALLBACK_FEATURE_FLAGS: Record<FeatureFlagKey, boolean> = {
  [FeatureFlagKey.WebPhoneAgent]: false,
  [FeatureFlagKey.OauthMicrosoftOutlook_2026_04_22]: false,
  [FeatureFlagKey.OauthGoogleCalendar_2026_04_22]: false,
  [FeatureFlagKey.OauthGoogleMail_2026_05_21]: false,
  [FeatureFlagKey.VoiceID]: false,
  [FeatureFlagKey.OauthSalesforceEca_2026_05_21]: false,
  [FeatureFlagKey.WebUsageLimits]: false,
  [FeatureFlagKey.IntercomJwtIdentity]: false,
  [FeatureFlagKey.WebSuspendMember]: false,
  [FeatureFlagKey.ReconcileIntercomContacts]: false,
  [FeatureFlagKey.LicenseAccessGate]: false,
};
