import loadingLogo from "@bliro/web-app/assets/loading.svg";
import loadingWhiteLogo from "@bliro/web-app/assets/loading_white.svg";

// simple loading graphic
export function LoadingIcon({
  color = "white",
  size = 20,
}: {
  color?: "white" | "orange";
  size?: number;
  fullScreen?: boolean;
}) {
  if (color === "white")
    return (
      <img width={size} height={size} src={loadingWhiteLogo as unknown as string} alt="Loading" />
    );
  return <img width={size} height={size} src={loadingLogo as unknown as string} alt="Loading" />;
}
