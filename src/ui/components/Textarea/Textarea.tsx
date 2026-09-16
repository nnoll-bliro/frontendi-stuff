import clsx from "clsx";
import { forwardRef, RefAttributes } from "react";
import TextareaAutosize, { TextareaAutosizeProps } from "react-textarea-autosize";

import styles from "./Textarea.module.css";

export type TextareaProps = TextareaAutosizeProps &
  RefAttributes<HTMLTextAreaElement> & {
    variant?: "bodySmall" | "bodyNormal";
  };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "bodySmall", ...props }, ref) => {
    return (
      <TextareaAutosize
        ref={ref}
        className={clsx(styles["textarea"], styles[variant], className)}
        {...props}
      />
    );
  },
);
