import { FormControl, MenuItem, Select } from "@mui/material";
import clsx from "classnames";
import { ChevronDownIcon } from "lucide-react";

import styles from "./BliroObjectSelect.module.css";

interface IBliroObjectSelectProps {
  size?: "small" | "medium" | "large";
  placeholder: string;
  key_id: string;
  key_label: string;
  // TODO: auto fixed - please try to fix
  // oxlint-disable-next-line typescript/no-explicit-any
  value: any | null;
  // TODO: auto fixed - please try to fix
  // oxlint-disable-next-line typescript/no-explicit-any
  options: any[];
  // TODO: auto fixed - please try to fix
  // oxlint-disable-next-line typescript/no-explicit-any
  handleChange: (event: any, newValue: any) => void;
  disabled?: boolean;
}

const heightBySize = {
  small: "40px",
  medium: "48px",
  large: "56px",
};

export const BliroObjectSelect = ({
  size = "small",
  key_id,
  key_label,
  value,
  options,
  placeholder,
  handleChange,
  disabled = false,
}: IBliroObjectSelectProps) => {
  return (
    <FormControl fullWidth>
      <Select
        sx={{
          height: heightBySize[size],
        }}
        displayEmpty
        disabled={disabled}
        value={value}
        renderValue={(value) => {
          if (value === "")
            return (
              <span
                style={{ textTransform: "capitalize" }}
                className={clsx(styles.placeholder, "text-normalBody font-semiBold")}
              >
                {placeholder}
              </span>
            );
          return (
            <span
              style={{ textTransform: "capitalize" }}
              className="text-smallBody-20 font-regular"
            >
              {value[key_label]}
            </span>
          );
        }}
        onChange={handleChange}
        IconComponent={ChevronDownIcon}
      >
        {options.map((option) => (
          <MenuItem key={option[key_id]} value={option} sx={{ textTransform: "capitalize" }}>
            {option[key_label]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
