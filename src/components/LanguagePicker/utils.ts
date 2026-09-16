import { FilterOptionsState } from "@mui/material";

import { LanguageCode, LanguageOption } from "./GeneralLanguageDropdown";

export const filterLanguageOptions = <L extends LanguageCode>(
  opts: LanguageOption<L>[],
  state: FilterOptionsState<LanguageOption<L>>,
) => {
  const query = state.inputValue.toLowerCase().trim();
  if (!query) return opts;
  return opts.filter(
    (opt) =>
      opt.localizedName.toLowerCase().includes(query) ||
      opt.englishName.toLowerCase().includes(query) ||
      opt.code.toLowerCase().includes(query),
  );
};
