import { Box, Button, Stack, Typography } from "@mui/material";
import clsx from "classnames";
import { XIcon } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";

import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/fonts";
import { SquareIconButton } from "../SquareIconButton";

import styles from "./BliroSyncAutoComplete.module.css";

interface IBlrioSyncAutoCompleteProps {
  type: "hubspot" | "slack" | "salesforce";
  icon: ReactNode;
  title: string;
  selectBtnText: string;
  selectedValues: string[];
}

const MAX_SELECTED_ITEMS_COUNT = 6;

export const BliroSyncAutoComplete = ({
  icon,
  title,
  selectedValues,
  selectBtnText,
}: IBlrioSyncAutoCompleteProps) => {
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const selectedValuesText = useMemo(() => {
    const beforeRangeValues = selectedValues.slice(0, MAX_SELECTED_ITEMS_COUNT);
    const extraItemsCount = Math.max(0, selectedValues.length - MAX_SELECTED_ITEMS_COUNT);
    const result = `${beforeRangeValues.join(",")}${extraItemsCount > 0 ? ", +" + extraItemsCount : ""}`;
    return result;
  }, [selectedValues]);

  const handleSelectorClose = () => {
    setIsSelectOpen(false);
  };

  const handleSelectorOpen = () => {
    setIsSelectOpen(true);
  };

  return (
    <Box className={styles.container}>
      <Stack direction="row" alignItems="center" gap={1} className={styles.content}>
        {icon}
        <Stack direction="column" className={styles.contentItem}>
          <Typography variant="smallBody" fontWeight={fontWeight.semiBold} color={colors.dark[200]}>
            {title}
          </Typography>
          <Typography variant="xxSmallBody" color="#333">
            {selectedValuesText}
          </Typography>
        </Stack>
        <Button variant="outlined" size="small" onClick={handleSelectorOpen}>
          {selectBtnText}
        </Button>
      </Stack>
      <Box className={clsx(styles.selector, { [styles.open]: isSelectOpen })}>
        <Stack direction="row" alignItems="flex-start" className={styles.selectorHeader}>
          <Box className={styles.selectedValues}></Box>
          <SquareIconButton onClick={handleSelectorClose}>
            <XIcon size={20} color={colors.dark[400]} />
          </SquareIconButton>
        </Stack>
        <Stack direction="column" className={styles.selectorBody}>
          {selectedValues.map((value, idx) => {
            return (
              <Box key={idx} className={styles.selectorItem}>
                {value}
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
};
