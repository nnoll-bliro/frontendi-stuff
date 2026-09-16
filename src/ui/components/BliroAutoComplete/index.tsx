import { Autocomplete, ListItem, ListItemText, TextField, Typography } from "@mui/material";

import { colors } from "../../theme/colors";
import { fontWeight } from "../../theme/fonts";

import styles from "./BliroAutoComplete.module.css";

interface IBliroAutoCompleteProps {
  id: string | undefined;
  value: string | null;
  options: string[];
  required: boolean | undefined;
  // TODO: auto fixed - please try to fix
  // oxlint-disable-next-line typescript/no-explicit-any
  handleChange: (event: any, newValue: any) => void;
  // TODO: auto fixed - please try to fix
  // oxlint-disable-next-line typescript/no-explicit-any
  handleInputChange: (event: any, newValue: any) => void;
}

export const BliroAutoComplete = ({
  id,
  value,
  options,
  required,
  handleChange,
  handleInputChange,
}: IBliroAutoCompleteProps) => {
  return (
    <Autocomplete
      id={id}
      value={value}
      className={styles.container}
      onChange={handleChange}
      onInputChange={handleInputChange}
      options={options}
      renderOption={(props, option: string) => (
        <ListItem dense {...props} key={option}>
          <ListItemText
            primary={
              <Typography variant="smallBody" color={colors.dark[200]}>
                {option}
              </Typography>
            }
          />
        </ListItem>
      )}
      renderInput={(params) => (
        <TextField
          placeholder="Select Language"
          sx={{
            flex: 1,
            boxSizing: "border-box",
            "& .MuiInputBase-root::before": {
              display: "none",
            },
            "& .MuiInputBase-root::after": {
              display: "none",
            },
            "& .MuiInput-root": {
              paddingRight: "0px !important",
            },
            "& .MuiAutocomplete-endAdornment": {
              display: "none",
            },
            "& .MuiAutocomplete-root": {
              paddingRight: "0px !important",
            },
            "& .MuiInput-root .MuiInput-input": {
              padding: "10px 16px",
              color: colors.dark[200],
              fontSize: "14px",
              fontWeight: fontWeight.regular,
              lineHeight: "22px",
              letterSpacing: "-0.28px",
            },
          }}
          className={styles.text}
          {...params}
          required={required}
          variant="standard"
        />
      )}
    />
  );
};
