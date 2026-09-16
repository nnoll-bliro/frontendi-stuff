import { OutputLanguageCode, outputLanguageCodes } from "@bliro/common-types/languages";

import { GeneralLanguageDropdown, GeneralLanguageDropdownProps } from "./GeneralLanguageDropdown";

type OutputLanguageDropdownProps = Omit<
  GeneralLanguageDropdownProps<OutputLanguageCode>,
  "availableLanguageCodes"
>;

export const OutputLanguageDropdown = (props: OutputLanguageDropdownProps) => {
  return <GeneralLanguageDropdown {...props} availableLanguageCodes={outputLanguageCodes} />;
};
