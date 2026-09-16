import { CircularProgress, Stack } from "@mui/material";
import QRCode from "react-qr-code";

const SIZE = 152;

interface VcardQrCodeProps {
  url?: string;
}

export const VcardQrCode = ({ url }: VcardQrCodeProps) => (
  <Stack alignItems="center" justifyContent="center" sx={{ height: `${SIZE}px` }}>
    {url ? (
      <QRCode
        size={SIZE}
        style={{
          height: "auto",
          width: `${SIZE}px`,
          alignSelf: "flex-start",
        }}
        value={url}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      />
    ) : (
      <CircularProgress size={24} />
    )}
  </Stack>
);
