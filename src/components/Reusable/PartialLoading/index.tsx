import loadingLogo from "@bliro/web-app/assets/loading.svg";
import classNames from "classnames";

import styles from "./PartialLoading.module.css";

// simple loading graphic
export function PartialLoading({
  size = 35,
  lightbox = false,
}: {
  size?: number;
  lightbox?: boolean;
}) {
  return (
    <div className={styles.container}>
      <div className={classNames(styles.spinner, { [styles.lightbox]: lightbox })}>
        <img width={size} height={size} src={loadingLogo as unknown as string} alt="Loading" />
      </div>
    </div>
  );
}
