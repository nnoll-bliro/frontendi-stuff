import { MarqueeWrapper } from "@bliro/ui/components/MarqueeWrapper";
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { Box, Stack, Typography } from "@mui/material";
import { Emoji } from "emoji-picker-react";

import styles from "./DropDownList.module.css";

export interface IDropDownItem {
  label: string;
  // TODO: auto fixed - please try to fix
  // oxlint-disable-next-line typescript/no-explicit-any
  icon?: any;
  value: string;
}

interface IDropDownListProps {
  items: IDropDownItem[];
  handleChange: (item: IDropDownItem) => void;
}

export const DropDownList = ({ items, handleChange }: IDropDownListProps) => {
  return (
    <Box className={styles.container}>
      <Box className={styles.wrapper}>
        {items.map((item, idx) => {
          return (
            <Stack
              key={idx}
              direction="row"
              p={0.5}
              gap={1}
              alignItems="center"
              className={styles.marqueeItem}
              onClick={() => handleChange(item)}
            >
              {item.icon && <Emoji unified={item.icon} size={25} />}

              <Stack direction="column" sx={{ width: "calc(100% - 20px)" }}>
                <MarqueeWrapper marginTop={false} maxLen={25} textLen={item.value.length}>
                  <Typography
                    className={styles.ellipsis}
                    variant="xSmallBody"
                    fontWeight={fontWeight.semiBold}
                    color={colors.dark[200]}
                    component="div"
                  >
                    {item.value}
                  </Typography>
                </MarqueeWrapper>
              </Stack>
            </Stack>
          );
        })}
      </Box>
    </Box>
  );
};
