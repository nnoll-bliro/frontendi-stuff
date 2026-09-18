import { Shield } from "lucide-react";

import { EmptyState } from "@/components/playground/EmptyState";
import { PageHeader } from "@/components/playground/PageHeader";

export const SettingsSharingPage = () => (
  <>
    <PageHeader
      title="Sharing"
      description="Organisation-wide sharing policies. Not yet available."
    />
    <EmptyState
      Icon={Shield}
      title="Sharing policies are coming soon"
      description="This preview does not grant access or change existing permissions."
    />
  </>
);
