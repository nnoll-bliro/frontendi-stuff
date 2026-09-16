import z from "zod";

import { FeatureFlagKey } from "./feature-flags";

// Integration keys come in three flavours, kept as separate enums so the rest
// of the codebase can be precise about which it means:
// - `oauth` keys have a per-user row in the user's `integrations` subcollection
//   (the per-user OAuth refresh token *is* the connection).
// - `org-minted` keys are configured once at the org level and have no per-user
//   row; tokens are minted on demand (e.g. SAP C4C's SAML-bearer flow).
// - `native` keys have no connection at all: `bliro` groups the built-in tools
//   that act on Bliro's own system (notes, calls, meetings). Always present for
//   every user, so there is no connect flow, no instance, and no pinning.
export const OauthIntegrationKey = z.enum([
  "microsoft-outlook",
  "microsoft-dynamics",
  "google-calendar",
  "google-mail",
  "microsoft-mail",
  "salesforce",
  "hubspot",
  "slack",
]);
export type OauthIntegrationKey = z.infer<typeof OauthIntegrationKey>;

export const CalendarIntegrationKey = z.enum(["google-calendar", "microsoft-outlook"]);
export type CalendarIntegrationKey = z.infer<typeof CalendarIntegrationKey>;

export const OrgMintedIntegrationKey = z.enum(["sap-c4c"]);
export type OrgMintedIntegrationKey = z.infer<typeof OrgMintedIntegrationKey>;

// Native (connection-less) integration keys — see the flavour note above.
export const NativeIntegrationKey = z.enum(["bliro"]);
export type NativeIntegrationKey = z.infer<typeof NativeIntegrationKey>;

/**
 * Every key with a connection to resolve — the two connectable flavours, and so exactly
 * the keys `./integrationCatalog` has an entry for, which its `_everyConnectableKeyCatalogued`
 * guard enforces. The complement of {@link NativeIntegrationKey} within
 * {@link IntegrationKey}.
 *
 * Use this wherever "one per catalogued integration" is the invariant: a record typed on it
 * demands an entry for every connectable key, where `Record<IntegrationKey, …>` also demands
 * the native keys that deliberately have none.
 */
export const ConnectableIntegrationKey = z.enum([
  ...OauthIntegrationKey.options,
  ...OrgMintedIntegrationKey.options,
]);
export type ConnectableIntegrationKey = z.infer<typeof ConnectableIntegrationKey>;

export const IntegrationKey = z.enum([
  ...ConnectableIntegrationKey.options,
  ...NativeIntegrationKey.options,
]);
export type IntegrationKey = z.infer<typeof IntegrationKey>;

// Widened to `string` on purpose: membership is tested against the broader
// `IntegrationKey`, which a `readonly ["bliro"]` tuple cannot accept.
const NATIVE_INTEGRATION_KEYS: ReadonlySet<string> = new Set(NativeIntegrationKey.options);

/**
 * Whether `key` is a native (connection-less, always-present) integration such
 * as `bliro`. Native keys have no per-user connection, no instance, and no
 * `IntegrationType` — callers that resolve connections or pins must never treat
 * them as connectable (they are handled as always-available instead). Narrows, so
 * the negative branch proves the remaining key is connectable.
 *
 * The key-based connected-state helpers short-circuit on this: the backend's
 * `userIntegrationReads.hasConnectedIntegration` (and `hasAnyConnectedIntegration` through
 * it), the web app's `userCtx.isIntegrationConnected`, and the tool registry's
 * `userHasIntegration` all answer `true` for a native key rather than looking for a row that
 * does not exist. The `array*` helpers below are the raw row scans they wrap — the
 * short-circuit lives in the wrapper, not here.
 *
 * Three deliberately never short-circuit. {@link isIntegrationConnected} takes a connection
 * *row*, so it has no key to branch on and can never be reached with a native one. The other
 * two hand back a row, and a native key has none: the backend's `hasIntegrationOfKey` keeps
 * its literal `false`, and its `findConnectedIntegration` its `undefined`.
 */
export const isNativeIntegration = (key: IntegrationKey): key is NativeIntegrationKey =>
  NATIVE_INTEGRATION_KEYS.has(key);

/**
 * The functional type an integration belongs to — the unit that instance
 * pinning operates on (at most one active instance per type at use time). The
 * type is always derived from the `integrationKey`.
 */
export const IntegrationType = z.enum(["calendar", "crm", "dm", "email"]);
export type IntegrationType = z.infer<typeof IntegrationType>;

/**
 * A user's or org's pinned integration instance per type: the `IntegrationInstance`
 * to resolve for that type. Authoritative — an absent pin resolves to nothing, so a
 * writer that mints an instance has to pin it. Same shape on `user.settings` and
 * `Organization.settings`.
 */
export const integrationPinsSchema = z
  .object({
    calendar: z.object({ instanceId: z.string() }),
    crm: z.object({ instanceId: z.string() }),
    dm: z.object({ instanceId: z.string() }),
    email: z.object({ instanceId: z.string() }),
  })
  .partial();
export type IntegrationPins = z.infer<typeof integrationPinsSchema>;

/**
 * The effective pinned instance for `type`, merging the user's and the org's pin
 * maps under D5 governance: an org admin may override the org pin with their own
 * (`userPin ?? orgPin`), while every other member is governed by the org pin when
 * one exists (`orgPin ?? userPin`). Returns `undefined` when neither is set.
 *
 * Takes the whole `IntegrationPins` maps (not pre-extracted ids) so the per-type
 * lookup + governance merge live here, not in each caller. Single source of truth
 * for the merge so the web app's active-instance display and the backend's
 * execution-time resolver (`resolveActiveConnection` / `getActiveIntegrationPins`)
 * can never disagree.
 */
export const effectivePinInstanceId = ({
  userPins,
  orgPins,
  type,
  isOrgAdmin,
}: {
  userPins: IntegrationPins | undefined;
  orgPins: IntegrationPins | undefined;
  type: IntegrationType;
  isOrgAdmin: boolean;
}): string | undefined => {
  const userPinInstanceId = userPins?.[type]?.instanceId;
  const orgPinInstanceId = orgPins?.[type]?.instanceId;
  return isOrgAdmin
    ? (userPinInstanceId ?? orgPinInstanceId)
    : (orgPinInstanceId ?? userPinInstanceId);
};

/**
 * The active item among usable candidates: the one whose instance is pinned, when
 * the pin names a usable candidate — else `undefined`. Pins are authoritative:
 * there is NO first-usable fallback, so an absent pin, or a pin pointing at a
 * candidate that isn't usable (disconnected/dangling), resolves to "nothing
 * active" rather than silently promoting another instance.
 *
 * Shared so the web app (over connection views) and the backend
 * (`resolveActiveConnection`, over resolved connections) resolve the active
 * instance identically; changing the rule here changes both at once.
 */
export const selectActiveByPin = <T>({
  usableInPriorityOrder,
  getInstanceId,
  pinnedInstanceId,
}: {
  usableInPriorityOrder: readonly T[];
  getInstanceId: (item: T) => string | null;
  pinnedInstanceId: string | undefined;
}): T | undefined => {
  if (!pinnedInstanceId) return undefined;
  return usableInPriorityOrder.find((item) => getInstanceId(item) === pinnedInstanceId);
};

/**
 * Canonical grouping of integration keys by type, in display order. Single
 * source of truth for two facts: which type a key belongs to, and the order
 * keys are presented in across UI surfaces (the settings integration list and
 * the call sync dialog). Adding a key here is the only place it needs to be
 * typed — {@link integrationTypeForKey} is derived from it, and the guard below
 * fails the build if a key is left ungrouped.
 */
export const orderedIntegrationKeysByType = {
  calendar: ["microsoft-outlook", "google-calendar"],
  email: ["microsoft-mail", "google-mail"],
  crm: ["hubspot", "microsoft-dynamics", "salesforce", "sap-c4c"],
  dm: ["slack"],
} satisfies Record<IntegrationType, IntegrationKey[]>;

// Compile-time guard: every connectable key must be grouped above. Starting from
// `ConnectableIntegrationKey` rather than subtracting the native ones from
// `IntegrationKey` says that in the type — native keys have no `IntegrationType` by
// design, and are now absent rather than excluded. A connectable key left ungrouped
// still makes `UngroupedKey` non-`never` and fails this assignment.
type UngroupedKey = Exclude<
  ConnectableIntegrationKey,
  (typeof orderedIntegrationKeysByType)[IntegrationType][number]
>;
const _everyKeyGrouped: [UngroupedKey] extends [never] ? true : never = true;
void _everyKeyGrouped;

/**
 * The functional type a *connectable* `integrationKey` belongs to, looked up
 * from {@link orderedIntegrationKeysByType} so the fact lives in exactly one
 * place. Always derived from the key, never stored on an instance.
 *
 * Takes {@link ConnectableIntegrationKey} rather than {@link IntegrationKey}: native keys
 * (see {@link isNativeIntegration}) have no type and never flow through connection/pin
 * resolution, so a caller holding a possibly-native key has to narrow before asking —
 * the compiler now says which callers those are.
 */
export const integrationTypeForKey = (key: ConnectableIntegrationKey): IntegrationType => {
  for (const type of IntegrationType.options) {
    for (const groupedKey of orderedIntegrationKeysByType[type]) {
      if (groupedKey === key) return type;
    }
  }
  // Unreachable while the parameter type holds — `_everyKeyGrouped` proves every
  // connectable key is grouped above. Kept for a key that reaches here unvalidated.
  throw new Error(`No type for integration key: ${key}`);
};

// Compile-time guard: no native key may be an accepted argument, which is what makes the
// throw above unreachable. Widening the parameter back to `IntegrationKey` fails this
// assignment. (The test file's `@ts-expect-error` cannot carry this — `common-types:typecheck`
// does not include tests.)
//
// Stated as "the overlap is empty" rather than `NativeIntegrationKey extends Parameters<…>`:
// that form asks about the union as a whole, so with two native keys it still passes when one
// of them leaks into `ConnectableIntegrationKey`. Distributing does not fix it either — the
// per-key results union back to `true | never`, which is `true`.
type NativeKeyAccepted = Extract<NativeIntegrationKey, Parameters<typeof integrationTypeForKey>[0]>;
const _noNativeKeyHasAType: [NativeKeyAccepted] extends [never] ? true : never = true;
void _noNativeKeyHasAType;

export interface Integration {
  _id: string;
  // The IntegrationInstance this connection is to — the id that disambiguates
  // one of several connections of a multi-instance key (e.g. two Salesforce
  // orgs, several Dynamics environments). Present on server-served reader rows
  // (the `GET /users/self` integration view); absent/null on legacy embedded
  // rows and on locally-constructed ones.
  instanceId?: string | null;
  tpEmail?: string | null;
  tpInstanceUrl?: string | null;
  tpExpireAt?: Date | null;
  // Tri-state connection-validity stamp: a Date = connection confirmed working
  // at that time (successful call, token refresh, or health-check probe);
  // `null` = definitively disconnected (set only by the health check); absent =
  // never checked yet → treated as connected pending a probe. The backend
  // derives the client-facing `tpExpireAt` from this.
  tpValidityConfirmedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  //meta data integrations
  integrationKey: IntegrationKey;
  displayName: string;
  description: string;
  icon: string;
  isDestination: boolean;
  type?: IntegrationType | null;
  settings?: Record<string, unknown> | null;
  // @deprecated - persisted in Azure Key Vault instead
  tpEncRefreshToken?: string | null;
  // @deprecated - persisted in Azure Key Vault instead
  tpEncAccessToken?: string | null;
  // The feature-flag key that gated the scope set this integration was last connected under.
  // Null means it was connected under the unflagged base scope. Compare against the user's
  // currently-required version (see `resolveRequiredScopeVersion`) to detect stale scopes.
  scopeVersion?: FeatureFlagKey | null;
}

/**
 * The single client-facing connection check: whether the integration is
 * currently connected. Reads `tpExpireAt`, which the backend derives from the
 * validity stamp (far-future when connected, far-past when disconnected — see
 * docs/oauth-connection-health-check.md). All web-app validity checks funnel
 * through this so they stay consistent.
 */
export const isValidIntegration = (integration: Integration): boolean => {
  return (
    !!integration &&
    !!integration.tpExpireAt &&
    new Date(integration.tpExpireAt).getTime() > new Date().getTime()
  );
};

/**
 * Whether the integration is currently connected, derived from the validity
 * stamp. It stays connected until a definitive auth failure nulls the stamp;
 * an expired access token is refreshed automatically. This is the single shared
 * backend check — "connected" and "valid" have collapsed into one under the
 * validity model.
 *
 * Tri-state on `tpValidityConfirmedAt` (NOT the vestigial stored `tpExpireAt`):
 * `null` = definitively disconnected; a Date = connected; `undefined`/absent =
 * never checked yet (existing rows) → treated as connected pending a probe.
 * Hence, strict `!== null`, so only an explicit `null` reads as disconnected.
 *
 * Pure domain logic — takes only the fields it reads, so it serves both the
 * Mongoose document and the plain {@link Integration} interface.
 */
export const isIntegrationConnected = (
  integration: Pick<Integration, "tpValidityConfirmedAt"> | null | undefined,
): boolean => {
  return !!integration && integration.tpValidityConfirmedAt !== null;
};

/**
 * The array's integration row for `key` regardless of connected state, or
 * `undefined` — the shared filter-by-key. Generic over the row shape so callers
 * keep their richer element type (e.g. the full {@link Integration}) on the
 * returned row. Callers pass `user.integrations`.
 */
export const arrayFindIntegrationByKey = <T extends Pick<Integration, "integrationKey">>({
  integrations,
  integrationKey,
}: {
  integrations: ReadonlyArray<T> | undefined;
  integrationKey: IntegrationKey;
}): T | undefined => (integrations ?? []).find((i) => i.integrationKey === integrationKey);

/**
 * The array's currently-connected integration row for `key`, or `undefined` —
 * {@link arrayFindIntegrationByKey} narrowed by {@link isIntegrationConnected}.
 */
export const arrayFindConnectedIntegration = <
  T extends Pick<Integration, "integrationKey" | "tpValidityConfirmedAt">,
>({
  integrations,
  integrationKey,
}: {
  integrations: ReadonlyArray<T> | undefined;
  integrationKey: IntegrationKey;
}): T | undefined => {
  const integration = arrayFindIntegrationByKey({ integrations, integrationKey });
  return integration && isIntegrationConnected(integration) ? integration : undefined;
};

/**
 * Whether the array holds a connected integration for the given key — the
 * shared spelling of the filter-by-key + {@link isIntegrationConnected} check.
 * Callers pass `user.integrations`.
 */
export const arrayHasConnectedIntegration = ({
  integrations,
  integrationKey,
}: {
  integrations:
    | ReadonlyArray<Pick<Integration, "integrationKey" | "tpValidityConfirmedAt">>
    | undefined;
  integrationKey: IntegrationKey;
}): boolean => arrayFindConnectedIntegration({ integrations, integrationKey }) !== undefined;
