import { BliroCheckBox } from "@bliro/ui/components/BliroCheckBox";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState, ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmButtonText: string;
  cancelButtonText: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  confirmButtonColor?: "primary" | "secondary" | "error" | "success" | "warning";
  /** When provided, renders a checkbox that must be checked before confirming. */
  acknowledgmentLabel?: string;
  titleIcon?: ReactNode;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
  maxWidth,
  confirmButtonColor = "primary",
  acknowledgmentLabel,
  titleIcon,
}: ConfirmDialogProps) => {
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsAcknowledged(false);
      setIsLoading(false);
    }
  }, [open]);

  const confirmDisabled = (acknowledgmentLabel !== undefined && !isAcknowledged) || isLoading;

  const handleClose = () => {
    if (!isLoading) onCancel();
  };

  const handleConfirm = async () => {
    const result = onConfirm();
    if (result instanceof Promise) {
      setIsLoading(true);
      try {
        await result;
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle sx={{ pr: "40px", pl: "40px", pt: "40px" }}>
        <Stack direction="column" gap={1}>
          {titleIcon}
          <Typography variant="subtitle1" color={colors.dark[100]} component="div">
            {title}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pr: "40px", pl: "40px" }}>
        <Stack spacing={2}>
          <Typography variant="normalBody" fontWeight={fontWeight.regular} color={colors.dark[200]}>
            {message}
          </Typography>
          {acknowledgmentLabel !== undefined && (
            <Stack direction="row" alignItems="flex-start" gap={1}>
              <BliroCheckBox
                size={18}
                checked={isAcknowledged}
                onChange={setIsAcknowledged}
                disabled={isLoading}
                aria-label={acknowledgmentLabel}
              />
              <Typography
                variant="normalBody"
                fontWeight={fontWeight.semiBold}
                color={colors.dark[100]}
                onClick={() => !isLoading && setIsAcknowledged((prev) => !prev)}
                sx={{ cursor: isLoading ? "default" : "pointer", mt: "-3px" }}
              >
                {acknowledgmentLabel}
              </Typography>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ pr: "40px", pl: "40px", pb: "40px" }}>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={1}>
          <Button onClick={handleClose} variant="outlined" color="secondary" disabled={isLoading}>
            {cancelButtonText}
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={confirmButtonColor}
            disabled={confirmDisabled}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}
            autoFocus
          >
            {confirmButtonText}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
