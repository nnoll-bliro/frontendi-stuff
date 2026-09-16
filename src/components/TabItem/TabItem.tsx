import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { Stack, Typography } from "@mui/material";
import classNames from "classnames";
import { LucideProps } from "lucide-react";
import { ComponentType } from "react";

import styles from "./TabItem.module.css";

interface TabItemProps {
  title: string;
  Icon: ComponentType<LucideProps>;
  isActive: boolean;
  onClick: () => void;
  // Icon edge length in px; defaults to 20 to leave existing tab strips unchanged.
  iconSize?: number;
}

export const TabItem = ({ title, Icon, isActive, onClick, iconSize = 20 }: TabItemProps) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      className={classNames(styles.tabItem, { [styles.active]: isActive })}
      onClick={onClick}
    >
      <Icon size={iconSize} className={styles.icon} />
      <Typography
        className={styles.title}
        variant="smallBody"
        fontWeight={fontWeight.semiBold}
        color={colors.dark[500]}
      >
        {title}
      </Typography>
    </Stack>
  );
};
