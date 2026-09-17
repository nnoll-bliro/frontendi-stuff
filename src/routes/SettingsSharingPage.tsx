import { Shield } from "lucide-react";

import { EmptyState } from "@/components/playground/EmptyState";
import { PageHeader } from "@/components/playground/PageHeader";

export const SettingsSharingPage = () => (
  <>
    <PageHeader title="Sharing" description="Organization sharing policies · Future capability" />
    <EmptyState
      Icon={Shield}
      title="Sharing policies are not available yet"
      description="This is a navigation placeholder only. No access is granted, changed, or enforced here, and there are no policy controls in this prototype."
    />
  </>
);
