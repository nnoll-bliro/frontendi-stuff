import { Tooltip } from "@mui/material";
import { CircleAlert, CircleCheck, CircleDashed, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

import styles from "./SendStatusBadege.module.css";

interface SendStatusBadgeProps {
  status: "sent" | "draft" | "sendFailed" | "default";
}

// Inspired by TemplatePicker to align style
export const SendStatusBadge = ({ status }: SendStatusBadgeProps) => {
  const { t } = useTranslation();

  function getTooltipText(status: string) {
    switch (status) {
      case "draft":
        return t("sendStatus.draft");
      case "sent":
        return t("sendStatus.sent");
      case "sendFailed":
        return t("sendStatus.failed");
      default:
        return t("sendStatus.default");
    }
  }

  if (status === "draft") {
    return (
      <div className={styles.statusIconContainer}>
        <CircleDashed className={`${styles.statusIcon} ${styles.hiddenIcon}`} />
      </div>
    );
  } else if (status === "sent") {
    return (
      <Tooltip title={getTooltipText(status)} placement="top" arrow>
        <div className={styles.statusIconContainer}>
          <Send className={styles.statusIcon} />
        </div>
      </Tooltip>
    );
  } else if (status === "sendFailed") {
    return (
      <Tooltip title={getTooltipText(status)} placement="top" arrow>
        <div className={styles.statusIconContainer}>
          <CircleAlert className={styles.statusIcon} />
        </div>
      </Tooltip>
    );
  } else {
    return (
      <div className={styles.statusIconContainer}>
        <CircleCheck className={`${styles.statusIcon} ${styles.hiddenIcon}`} />
      </div>
    );
  }
};
