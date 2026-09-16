import clsx from "classnames";
import { KeyboardEvent } from "react";

import styles from "./BliroCheckBox.module.css";

/**
 * Props for the BliroCheckBox component
 */
export interface IBliroCheckBoxProps {
  /** Size of the checkbox in pixels (default: 24) */
  size?: number;
  /** Whether the checkbox is checked (default: false) */
  checked?: boolean;
  /** Whether the checkbox is disabled (default: false) */
  disabled?: boolean;
  /** Function called when checkbox state changes */
  onChange?: (checked: boolean) => void;
  /** Accessible label for screen readers */
  "aria-label"?: string;
}

export const BliroCheckBox = ({
  size = 24,
  checked = false,
  disabled = false,
  onChange,
  "aria-label": ariaLabel,
}: IBliroCheckBoxProps) => {
  const isInteractive = Boolean(onChange);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || !isInteractive) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange?.(!checked);
    }
  };

  const handleClick = () => {
    if (disabled || !isInteractive) return;
    onChange?.(!checked);
  };

  const tabIndex = isInteractive ? (disabled ? -1 : 0) : undefined;

  return (
    <div
      role={isInteractive ? "checkbox" : undefined}
      aria-checked={isInteractive ? checked : undefined}
      aria-label={isInteractive ? ariaLabel : undefined}
      aria-disabled={isInteractive && disabled ? true : undefined}
      aria-hidden={!isInteractive ? true : undefined}
      tabIndex={tabIndex}
      className={clsx(styles.checkbox, {
        [styles.checked]: checked,
        [styles.disabled]: disabled,
      })}
      style={{ width: size, height: size }}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      onClick={isInteractive ? handleClick : undefined}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size * 0.8}
        height={size * 0.8}
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          className={styles.checkIcon}
          d="M13.3332 4L5.99984 11.3333L2.6665 8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
