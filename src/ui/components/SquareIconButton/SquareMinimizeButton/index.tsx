import { MinusIcon, XIcon } from "lucide-react";

import { SquareIconButton } from "../../SquareIconButton";

import styles from "./SquareMinimizeButton.module.css";

interface SquareMinimizeButtonProps {
  platform: "win32" | "darwin" | "not-supported" | null;
  onClick: () => void;
}

export const SquareMinimizeButton = ({ platform, onClick }: SquareMinimizeButtonProps) => {
  return (
    <SquareIconButton size="small" onClick={onClick}>
      {platform === "darwin" ? (
        <XIcon className={styles.icon} />
      ) : (
        <MinusIcon className={styles.icon} />
      )}
    </SquareIconButton>
  );
};
