import classNames from "classnames";
import { InputHTMLAttributes, Ref } from "react";

import styles from "./TitleEditor.module.css";

interface TitleEditorProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  ref?: Ref<HTMLInputElement>;
  isError?: boolean;
}

export const TitleEditor = (props: TitleEditorProps) => {
  const { className, ref, isError, ...inputProps } = props;

  return (
    <input
      {...inputProps}
      ref={ref}
      type="text"
      className={classNames(styles["titleInput"], "font-semiBold", className, {
        [styles["titleInputError"]]: isError,
      })}
    />
  );
};
