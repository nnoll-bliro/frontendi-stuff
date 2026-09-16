import { IntegrationKey, IntegrationType } from "@bliro/common-types/Integration";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { IntegrationIcon, useIntegrationName } from "@bliro/web-app/components/IntegrationDisplay";
import { Box, Button, Stack, Typography } from "@mui/material";
import { BookXIcon, CalendarX2Icon, MailXIcon, MessageSquareXIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface IntegrationExpiredBannerProps {
  integrationKey: IntegrationKey;
  integrationType?: IntegrationType | null;
  onReconnect: () => void;
  // Omit to render a non-dismissible banner (e.g. the integration settings page).
  onDismiss?: () => void;
  isReconnecting?: boolean;
  // Stretch to the container width (settings pages center their children). The call page relies on
  // the default flex stretch, so leave this off there to keep the existing layout untouched.
  fullWidth?: boolean;
}

interface BannerCopy {
  title: string;
  description: string;
  reconnectLabel: string;
  dismissLabel: string;
}

const useBannerCopy = (integrationKey: IntegrationKey): BannerCopy => {
  const { t } = useTranslation();
  const integrationName = useIntegrationName(integrationKey);

  switch (integrationKey) {
    case "microsoft-outlook":
      return {
        title: t("meetings.upcoming.calendarIntegrationExpired.titleOutlook"),
        description: t("meetings.upcoming.calendarIntegrationExpired.description"),
        reconnectLabel: t("meetings.upcoming.calendarIntegrationExpired.reconnectCalendar"),
        dismissLabel: t("meetings.upcoming.calendarIntegrationExpired.dismiss"),
      };
    case "google-calendar":
      return {
        title: t("meetings.upcoming.calendarIntegrationExpired.titleGoogle"),
        description: t("meetings.upcoming.calendarIntegrationExpired.description"),
        reconnectLabel: t("meetings.upcoming.calendarIntegrationExpired.reconnectCalendar"),
        dismissLabel: t("meetings.upcoming.calendarIntegrationExpired.dismiss"),
      };
    default:
      return {
        title: t("integrationExpiredBanner.title", { name: integrationName }),
        description: t("integrationExpiredBanner.description"),
        reconnectLabel: t("integrationExpiredBanner.reconnect"),
        dismissLabel: t("integrationExpiredBanner.dismiss"),
      };
  }
};

// The large left-hand "type" icon — a Lucide glyph per integration category, matching the calendar
// banner's existing CalendarX2Icon styling (size, color, stroke width).
const TypeIcon = ({ integrationType }: { integrationType?: IntegrationType | null }) => {
  const props = { size: 32, color: colors.orange[100], strokeWidth: 1.5 };
  switch (integrationType) {
    case "crm":
      return <BookXIcon {...props} />;
    case "email":
      return <MailXIcon {...props} />;
    case "dm":
      return <MessageSquareXIcon {...props} />;
    case "calendar":
    default:
      return <CalendarX2Icon {...props} />;
  }
};

export const IntegrationExpiredBanner = ({
  integrationKey,
  integrationType,
  onReconnect,
  onDismiss,
  isReconnecting,
  fullWidth,
}: IntegrationExpiredBannerProps) => {
  const copy = useBannerCopy(integrationKey);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        padding: "12px 16px",
        borderRadius: 4,
        border: `1px solid ${colors.orange[300]}`,
        backgroundColor: colors.orange[700],
        mt: 1,
        mb: 2,
        ...(fullWidth && { width: "100%", boxSizing: "border-box" }),
      }}
    >
      <Stack direction="row" alignItems="center" gap={1.5}>
        <TypeIcon integrationType={integrationType} />
        <Stack>
          <Typography
            variant="xSmallBody"
            fontWeight={fontWeight.semiBold}
            color={colors.dark[200]}
          >
            {copy.title}
          </Typography>
          <Typography variant="xxSmallBody" fontWeight={fontWeight.medium} color={colors.dark[400]}>
            {copy.description}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" gap={1}>
        {onDismiss && (
          <Button
            size="small"
            variant="text"
            color="secondary"
            onClick={onDismiss}
            sx={{ backgroundColor: colors.orange[700] }}
          >
            {copy.dismissLabel}
          </Button>
        )}
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={onReconnect}
          disabled={isReconnecting}
          startIcon={
            <Box
              sx={{
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IntegrationIcon integrationKey={integrationKey} size={18} />
            </Box>
          }
        >
          {copy.reconnectLabel}
        </Button>
      </Stack>
    </Stack>
  );
};
