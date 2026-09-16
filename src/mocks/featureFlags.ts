import { FALLBACK_FEATURE_FLAGS, FeatureFlagKey } from "@bliro/common-types/feature-flags";

/**
 * Stand-in for the Amplitude-backed flag store the real app reads through
 * `useFeatureFlag`. Keyed on the **real** `FeatureFlagKey` enum, so a component
 * that gates on a flag here gates on the same string in the monorepo.
 *
 * Flip these while prototyping — it is the fastest way to see a page in its
 * other state without touching the database or the component.
 */
const OVERRIDES: Partial<Record<FeatureFlagKey, boolean>> = {
  [FeatureFlagKey.WebPhoneAgent]: true,
  [FeatureFlagKey.VoiceID]: true,
};

const FLAGS: Record<FeatureFlagKey, boolean> = { ...FALLBACK_FEATURE_FLAGS, ...OVERRIDES };

export function isFeatureEnabled(key: FeatureFlagKey): boolean {
  return FLAGS[key];
}

/**
 * Hook shape matches the web-app's so gated JSX copies across unchanged. There is
 * no subscription here — the values are static for the lifetime of the page.
 */
export function useFeatureFlag(key: FeatureFlagKey): boolean {
  return isFeatureEnabled(key);
}

export { FeatureFlagKey };
