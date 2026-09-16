import { Box } from "@mui/material";
import clsx from "classnames";
import { ReactNode, useMemo } from "react";
import Marquee from "react-fast-marquee";

import styles from "./MarqueeWrapper.module.css";

interface IMarqueeWrapper {
  /** Content to be displayed inside the marquee */
  children: ReactNode;
  /** The speed of the marquee animation in pixels per second (default: 30) */
  speed?: number;
  /** The length of the text content to determine if marquee is needed */
  textLen: number;
  /** Maximum character length before enabling marquee animation (default: 30) */
  maxLen?: number;
  /** Delay in seconds before the marquee animation starts */
  initialDelay?: number; // delay seconds not milliseconds
  /** Whether to apply top margin styling (default: true) */
  marginTop?: boolean;
}

const LIMIT_MAX_CHARACTER_LENGTH = 30;
const MARQUEE_SPEED = 30;

export const MarqueeWrapper = ({
  textLen,
  speed = MARQUEE_SPEED,
  maxLen = LIMIT_MAX_CHARACTER_LENGTH,
  initialDelay,
  children,
  marginTop = true,
}: IMarqueeWrapper) => {
  const isLongText = useMemo(() => {
    return textLen >= maxLen;
  }, [textLen, maxLen]);

  return (
    <Box className={clsx(styles.text, { [styles.marginTop]: marginTop })}>
      {isLongText ? (
        <Marquee speed={speed} delay={initialDelay} className={styles.marquee}>
          <Box className={styles.marqueeContent}>{children}</Box>
        </Marquee>
      ) : (
        <Box className={styles.marquee}>{children}</Box>
      )}
      <Box className={styles.message}>{children}</Box>
    </Box>
  );
};
