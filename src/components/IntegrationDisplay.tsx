import {
  ConnectableIntegrationKey,
  IntegrationKey,
  NativeIntegrationKey,
} from "@bliro/common-types/Integration";
import { useTranslation } from "react-i18next";

import { CustomIcon } from "./utils/CustomIcon";

/** Kept in sync by hand with the `icon` field of libs/common-types/integrationCatalog.ts.
 *  Reading the catalog instead would hand every render site a `string | undefined`, where
 *  this record is total: typed on the connectable half, a key without an icon here is a
 *  compile error, and the native keys that have no catalog entry are not demanded. */
const CONNECTABLE_ICON_NAMES: Record<ConnectableIntegrationKey, string> = {
  "microsoft-outlook": "OutlookIcon",
  "microsoft-dynamics": "MicrosoftDynamicsIcon",
  "google-calendar": "GoogleCalendarIcon",
  "google-mail": "GmailIcon",
  "microsoft-mail": "OutlookIcon",
  salesforce: "SalesforceIcon",
  hubspot: "HubspotIcon",
  slack: "SlackIcon",
  "sap-c4c": "SapIcon",
};

/** Native keys have no catalog entry and no backend icon by design, so these are this
 *  file's own choice with nothing to diverge from. `bliro` reuses the app-icon mark and
 *  is only rendered by the built-in nav entry and its settings page. */
const NATIVE_ICON_NAMES: Record<NativeIntegrationKey, string> = {
  bliro: "BliroLogoAppIcon",
};

const INTEGRATION_ICON_NAMES: Record<IntegrationKey, string> = {
  ...CONNECTABLE_ICON_NAMES,
  ...NATIVE_ICON_NAMES,
};

interface IntegrationIconProps {
  integrationKey: IntegrationKey;
  size?: number;
}

export const IntegrationIcon = ({ integrationKey, size = 24 }: IntegrationIconProps) => (
  <CustomIcon icon={INTEGRATION_ICON_NAMES[integrationKey]} width={size} height={size} />
);

export const useIntegrationName = (integrationKey: IntegrationKey): string => {
  const { t } = useTranslation();
  return t(`integrationData.names.${integrationKey}`);
};
