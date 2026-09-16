import { Box } from "@mui/material";
import clsx from "classnames";

import styles from "./Divider.module.css";

interface IDividerProps {
  dir: "horizontal" | "vertical";
  height?: string;
  marginTop?: number | string;
  marginBottom?: number | string;
}

export const Divider = ({ dir, height, marginTop, marginBottom }: IDividerProps) => {
  return (
    <Box
      sx={{ height: height, marginTop: marginTop, marginBottom: marginBottom }}
      className={clsx(styles.container, styles[dir])}
    />
  );
};
