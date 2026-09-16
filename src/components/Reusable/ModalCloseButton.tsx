import { colors } from "@bliro/ui/theme/colors";
import { IconButton } from "@mui/material";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ModalCloseButtonProps {
  onClose: () => void;
}

export function ModalCloseButton({ onClose }: ModalCloseButtonProps) {
  const { t } = useTranslation();

  return (
    <IconButton
      onClick={onClose}
      size="small"
      aria-label={t("close")}
      sx={{ position: "absolute", top: "16px", right: "16px", color: colors.dark[400] }}
    >
      <X size={24} />
    </IconButton>
  );
}
