import { colors } from "@bliro/ui/theme/colors";
import { tokens } from "@bliro/ui/theme/tokens";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { Box, Button, Popover, Stack, Typography } from "@mui/material";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { MouseEvent, useMemo, useState } from "react";

import { DropDownList, IDropDownItem } from "./DropDownList";

import styles from "./DropDownSelect.module.css";

interface IDropDownSelectProps {
  id: string;
  label?: string;
  value: IDropDownItem;
  items: IDropDownItem[];
  setValue: (value: IDropDownItem) => void;
  readOnly?: boolean;
}

export const DropDownSelect = ({
  id: originalId,
  label,
  value,
  items,
  setValue,
  readOnly,
}: IDropDownSelectProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    if (readOnly) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (item: IDropDownItem) => {
    if (readOnly) return;
    setValue(item);
    handleClose();
  };

  const { isOpen, id } = useMemo(() => {
    const isOpen = Boolean(anchorEl);
    const id = isOpen ? originalId : undefined;
    return { isOpen, id };
  }, [anchorEl, originalId]);

  return (
    <Box>
      <Stack direction="row" gap={tokens.spacing.sm} alignItems="center">
        {label && (
          <Typography variant="xSmallBody" fontWeight={fontWeight.regular} color={colors.dark[400]}>
            {label}:
          </Typography>
        )}
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          aria-describedby={id}
          onClick={handleOpen}
          disabled={readOnly}
          {...(value.icon && { startIcon: value.icon })}
          endIcon={
            isOpen ? (
              <ChevronUpIcon size={20} color={colors.dark[400]} />
            ) : (
              <ChevronDownIcon size={20} color={colors.dark[400]} />
            )
          }
        >
          <Typography
            textAlign="left"
            variant="xSmallBody"
            fontWeight={fontWeight.semiBold}
            color={colors.dark[200]}
            sx={{ minWidth: "164px" }}
          >
            {value.label}
          </Typography>
        </Button>
      </Stack>
      <Popover
        id={id}
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        className={styles.popover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <DropDownList items={items} handleChange={handleChange} />
      </Popover>
    </Box>
  );
};
