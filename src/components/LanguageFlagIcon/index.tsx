import {
  BatchTranscriptionLanguageCode,
  getLanguageByCode,
  OutputLanguageCode,
  TranscriptionLanguageCode,
} from "@bliro/common-types/languages";
import { apiBaseUrl } from "@bliro/web-app/redux/api";

import { CustomIcon } from "../utils/CustomIcon";

import styles from "./LanguageFlagIcon.module.css";

interface ILanguageFlagIconProps {
  code: BatchTranscriptionLanguageCode | TranscriptionLanguageCode | OutputLanguageCode;
  width?: string | number;
  height?: string | number;
}

export const LanguageFlagIcon = ({
  code,
  width = "1em",
  height = "1em",
}: ILanguageFlagIconProps) => {
  if (code === "auto") {
    return <CustomIcon icon="BliroLogo" width={width} height={height} />;
  }

  const { icon } = getLanguageByCode(code);
  return <img className={styles.flag} src={`${apiBaseUrl}${icon}`} width={width} height={height} />;
};
