import { styled } from "@mui/material/styles";
import MuiSwitch, { SwitchProps as MuiSwitchProps } from "@mui/material/Switch";
import { ChangeEvent, ComponentType } from "react";

import { colors } from "../../theme/colors";

/**
 * Props for the Switch component
 */
interface IBliroSwitchProps extends MuiSwitchProps {
  /** Whether the switch is checked (default: false) */
  checked?: boolean;
  /** Whether the switch is disabled (default: false) */
  disabled?: boolean;
  /** Function called when switch state changes */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

function UnstyledBliroSwitch(props: IBliroSwitchProps) {
  return <MuiSwitch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />;
}

export const BliroSwitch: ComponentType<IBliroSwitchProps> = styled(UnstyledBliroSwitch)(
  ({ theme }) => ({
    width: 40,
    height: 20,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: 0,
      margin: 2,
      transitionDuration: "300ms",
      "&.Mui-checked": {
        transform: "translateX(20px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          backgroundColor: colors.orange[100],
          opacity: 1,
          border: 0,
          ...theme.applyStyles("dark", {
            backgroundColor: colors.orange[100],
          }),
        },
        "&.Mui-disabled + .MuiSwitch-track": {
          opacity: 0.5,
        },
      },
      "&.Mui-focusVisible .MuiSwitch-thumb": {
        color: colors.orange[100],
        border: "6px solid #fff",
      },
      "&.Mui-disabled .MuiSwitch-thumb": {
        color: theme.palette.grey[100],
        ...theme.applyStyles("dark", {
          color: theme.palette.grey[600],
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.7,
        ...theme.applyStyles("dark", {
          opacity: 0.3,
        }),
      },
    },
    "& .MuiSwitch-thumb": {
      boxSizing: "border-box",
      width: 16,
      height: 16,
    },
    "& .MuiSwitch-track": {
      borderRadius: 20 / 2,
      backgroundColor: colors.dark[600],
      opacity: 1,
      transition: theme.transitions.create(["background-color"], {
        duration: 500,
      }),
      ...theme.applyStyles("dark", {
        backgroundColor: colors.dark[600],
      }),
    },
  }),
);
