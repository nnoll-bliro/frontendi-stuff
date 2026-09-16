import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";

import styles from "./ErrorScreen.module.css";

interface IErrorScreenProps {
  subtitle?: string;
  reloadButton?: boolean;
}

export const ErrorScreen = ({ subtitle, reloadButton = false }: IErrorScreenProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.errorScreen}>
      <div className={styles.title}>{t("error")}</div>
      <div className={styles.subtitle}>{subtitle}</div>
      {reloadButton && (
        <Button variant="outlined" sx={{ fontSize: 15 }} onClick={() => window.location.reload()}>
          {t("reload")}
        </Button>
      )}
    </div>
  );
};
