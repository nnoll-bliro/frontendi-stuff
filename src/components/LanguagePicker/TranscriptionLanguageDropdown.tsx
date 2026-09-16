import {
  TranscriptionLanguageCode,
  transcriptionLanguageCodes,
} from "@bliro/common-types/languages";

import { GeneralLanguageDropdown, GeneralLanguageDropdownProps } from "./GeneralLanguageDropdown";

type TranscriptionLanguageDropdownProps = Omit<
  GeneralLanguageDropdownProps<TranscriptionLanguageCode>,
  "availableLanguageCodes"
>;

export const TranscriptionLanguageDropdown = (props: TranscriptionLanguageDropdownProps) => {
  return <GeneralLanguageDropdown {...props} availableLanguageCodes={transcriptionLanguageCodes} />;
};
